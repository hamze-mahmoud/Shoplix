const Product = require("../models/Product");
const Order = require("../models/Order");
const attachRatings = require("../utils/attachRatings");
const { getSeasonContext } = require("../utils/seasonEvents");
const { cache } = require("../config/cache");

// ============================================================
// AI product recommendations (hybrid).
//
// Layer 1 — scoring engine (always on): ranks every product from
//   popularity (units sold, recent-sales trending), quality (ratings),
//   freshness (new arrivals), seasonality (holiday/season calendar),
//   and the admin "featured" flag — then SELECTS a diverse list under
//   constraints (max per category, price-tier mix, audience spread)
//   with a seeded jitter that rotates the picks every 6 hours.
//
// Layer 2 — Claude curation (optional): when ANTHROPIC_API_KEY is set,
//   the top candidates are re-curated by Claude with real reasoning
//   about the date/holidays/audience, returning per-pick reasons.
//   Any failure falls back to Layer 1 silently.
//
// Personalization-ready: `getSmartRecommendations({ userId })` is part
// of the signature — plug user behaviour (orders, views) into
// `userBoost()` later without changing callers.
// ============================================================

const AUDIENCES = ["kids", "young", "women", "men", "elderly"];

// deterministic tiny hash → [0,1) for seeded jitter
function seeded01(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

// ---- signal gathering ------------------------------------------------

async function loadCandidates() {
  const products = await Product.find()
    .populate("category", "name translations")
    .lean();

  // units sold (all time + last 30 days) per product, one aggregation
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const sales = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        sold: { $sum: { $ifNull: ["$items.quantity", 1] } },
        soldRecent: {
          $sum: {
            $cond: [{ $gte: ["$createdAt", since] }, { $ifNull: ["$items.quantity", 1] }, 0],
          },
        },
      },
    },
  ]);
  const salesById = new Map(sales.map((s) => [String(s._id), s]));

  const withRatings = await attachRatings(products);
  return withRatings.map((p) => {
    const s = salesById.get(String(p._id));
    return { ...p, sold: s?.sold || 0, soldRecent: s?.soldRecent || 0 };
  });
}

// ---- scoring ---------------------------------------------------------

function priceOf(p) {
  const prices = (p.variants || []).map((v) => v.price).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : p.basePrice || 0;
}
function stockOf(p) {
  return (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
}

function seasonalScore(p, events) {
  const catName = p.category?.name || "";
  const text = `${p.name} ${catName}`;
  let best = 0;
  const matched = [];
  for (const ev of events) {
    if (ev.categories.test(catName) || ev.keywords.test(text)) {
      best = Math.max(best, ev.weight - 1); // weight 1.6 → 0.6 signal
      matched.push(ev.key);
    }
  }
  return { score: Math.min(best, 1), matched };
}

// Extension point for personalization (browsing history, past orders…).
// Return a 0..0.3 boost for this product given the user. Currently neutral.
// eslint-disable-next-line no-unused-vars
function userBoost(product, userId) {
  return 0;
}

function scoreAll(candidates, ctx, { audience, userId }) {
  const maxSold = Math.max(1, ...candidates.map((c) => c.sold));
  const maxRecent = Math.max(1, ...candidates.map((c) => c.soldRecent));

  // price terciles → budget / mid / premium
  const prices = candidates.map(priceOf).sort((a, b) => a - b);
  const t1 = prices[Math.floor(prices.length / 3)] || 0;
  const t2 = prices[Math.floor((2 * prices.length) / 3)] || 0;
  const tierOf = (price) => (price <= t1 ? "budget" : price <= t2 ? "mid" : "premium");

  const now = Date.now();

  return candidates.map((p) => {
    const price = priceOf(p);
    const stock = stockOf(p);
    const { score: seasonal, matched } = seasonalScore(p, ctx.events);

    const popularity = 0.25 * (Math.log1p(p.sold) / Math.log1p(maxSold));
    const trending = 0.15 * (Math.log1p(p.soldRecent) / Math.log1p(maxRecent));
    const quality = 0.2 * (p.ratingAvg / 5) * Math.min(1, p.ratingCount / 5);
    const ageDays = (now - new Date(p.createdAt).getTime()) / 86400000;
    const freshness = 0.15 * Math.exp(-ageDays / 60);
    const season = 0.2 * seasonal;
    const featured = p.isFeatured ? 0.05 : 0;
    const personal = userBoost(p, userId);

    // audience fit: tagged for the requested audience = strong; untagged =
    // weak generic fit; tagged for OTHER audiences only = excluded later.
    const tags = p.audienceTags || [];
    const audienceFit = !audience
      ? 0
      : tags.includes(audience)
      ? 0.25
      : tags.length === 0
      ? 0.02
      : -1; // marker: wrong audience

    // rotation: deterministic jitter that changes each 6h bucket
    const jitter = (seeded01(`${ctx.bucket}:${p._id}`) - 0.5) * 0.24;

    const outOfStockPenalty = stock === 0 ? -0.5 : 0;

    return {
      product: p,
      price,
      tier: tierOf(price),
      tags,
      matchedEvents: matched,
      audienceFit,
      score:
        popularity + trending + quality + freshness + season + featured +
        personal + (audienceFit > 0 ? audienceFit : 0) + jitter + outOfStockPenalty,
    };
  });
}

// ---- diverse selection ------------------------------------------------

function selectDiverse(scored, { limit, audience }) {
  // audience mode: exclude products tagged exclusively for other audiences
  let pool = scored.filter((s) => (audience ? s.audienceFit >= 0 : true));
  // prefer in-stock
  pool = pool.sort((a, b) => b.score - a.score);

  const picked = [];
  const perCategory = new Map();
  const perTier = { budget: 0, mid: 0, premium: 0 };
  const seenNames = new Set();
  const maxPerCategory = 2;
  const tierTarget = Math.floor(limit / 3);

  const canTake = (s, relaxTier) => {
    const cat = String(s.product.category?._id || "none");
    if ((perCategory.get(cat) || 0) >= maxPerCategory) return false;
    if (seenNames.has(s.product.name)) return false;
    if (!relaxTier && perTier[s.tier] >= tierTarget + 1) return false;
    return true;
  };
  const take = (s) => {
    picked.push(s);
    const cat = String(s.product.category?._id || "none");
    perCategory.set(cat, (perCategory.get(cat) || 0) + 1);
    perTier[s.tier]++;
    seenNames.add(s.product.name);
  };

  // pass 1: respect tier balance; pass 2: relax tiers; pass 3: relax category cap
  for (const relax of [false, true, "cat"]) {
    for (const s of pool) {
      if (picked.length >= limit) break;
      if (picked.includes(s)) continue;
      if (relax === "cat") {
        if (!seenNames.has(s.product.name)) take(s);
      } else if (canTake(s, relax)) {
        take(s);
      }
    }
    if (picked.length >= limit) break;
  }

  // "everyone" mode: nudge audience coverage — ensure ≥3 distinct audience
  // tags across picks by swapping in the best-scored missing-tag product.
  if (!audience) {
    const covered = new Set(picked.flatMap((s) => s.tags));
    const missing = AUDIENCES.filter((a) => !covered.has(a));
    for (const miss of missing) {
      if ([...covered].length >= 3) break;
      const candidate = pool.find(
        (s) => !picked.includes(s) && s.tags.includes(miss) && !seenNames.has(s.product.name)
      );
      if (candidate && picked.length) {
        picked[picked.length - 1] = candidate; // swap weakest pick
        candidate.tags.forEach((t) => covered.add(t));
      }
    }
  }

  return picked.slice(0, limit);
}

// ---- optional Claude curation -----------------------------------------

const memo = new Map(); // in-process cache: key → result (survives without Redis)

async function claudeCurate(candidates, ctx, { limit, audience }) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const list = candidates.slice(0, 24).map((s) => ({
    id: String(s.product._id),
    name: s.product.name,
    category: s.product.category?.name,
    price: s.price,
    tier: s.tier,
    rating: s.product.ratingAvg,
    reviews: s.product.ratingCount,
    sold: s.product.sold,
    audiences: s.tags,
    isNew: (Date.now() - new Date(s.product.createdAt)) / 86400000 < 45,
  }));

  const body = {
    model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
    max_tokens: 900,
    messages: [
      {
        role: "user",
        content:
          `You curate a storefront rail for an e-commerce shop serving Palestine/Israel. ` +
          `Today: ${new Date().toDateString()}. Season: ${ctx.season}. Active events: ${ctx.events.map((e) => e.name).join(", ") || "none"}. ` +
          (audience ? `Target audience: ${audience}. ` : `Audience: general — mix products for different people (men, women, kids, young, elderly). `) +
          `Pick exactly ${limit} product ids from this list. Rules: diverse categories (max 2 per category), balanced price tiers (budget/mid/premium), favour seasonal/holiday-relevant, well-rated, trending or new items; no duplicates. ` +
          `Reply with ONLY JSON: {"picks":[{"id":"...","reason":"<max 6 words>"}]}\n\n` +
          JSON.stringify(list),
      },
    ],
  };

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  const text = data.content?.map((c) => c.text || "").join("") || "";
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  if (!Array.isArray(json.picks) || !json.picks.length) throw new Error("bad picks");

  const byId = new Map(candidates.map((s) => [String(s.product._id), s]));
  const picked = [];
  for (const pick of json.picks) {
    const s = byId.get(String(pick.id));
    if (s && !picked.includes(s)) picked.push({ ...s, reason: String(pick.reason || "").slice(0, 60) });
    if (picked.length >= limit) break;
  }
  return picked.length >= Math.min(4, limit) ? picked : null;
}

// ---- public API --------------------------------------------------------

async function getSmartRecommendations({ limit = 8, audience = null, userId = null } = {}) {
  if (!AUDIENCES.includes(audience)) audience = null;
  limit = Math.min(Math.max(Number(limit) || 8, 3), 24);

  const ctx = getSeasonContext();
  const memoKey = `${ctx.bucket}:${audience || "all"}:${limit}`;

  if (memo.get(memoKey)) return memo.get(memoKey);
  if (memo.size > 200) memo.clear();

  const result = await cache.getOrSet(`products:smart:${memoKey}`, 6 * 3600, async () => {
    const candidates = await loadCandidates();
    const scored = scoreAll(candidates, ctx, { audience, userId });
    const bySCore = [...scored].sort((a, b) => b.score - a.score);

    let picks = selectDiverse(bySCore, { limit, audience });

    // Layer 2: Claude curation (optional, silent fallback)
    try {
      const curated = await claudeCurate(
        bySCore.filter((s) => (audience ? s.audienceFit >= 0 : true)),
        ctx,
        { limit, audience }
      );
      if (curated) picks = curated;
    } catch (e) {
      console.warn("Claude curation skipped:", e.message);
    }

    return {
      context: {
        season: ctx.season,
        events: ctx.events.map((e) => ({ key: e.key, name: e.name })),
        bucket: ctx.bucket,
        curated: !!picks[0]?.reason,
      },
      products: picks.map((s) => ({
        ...s.product,
        sold: s.product.sold,
        priceFrom: s.price,
        tier: s.tier,
        reason: s.reason || null,
        matchedEvents: s.matchedEvents,
      })),
    };
  });

  memo.set(memoKey, result);
  return result;
}

// ---- gift picks (WhatsApp concierge) -----------------------------------
// Budget-capped, multi-audience picks: in-stock, distinct categories,
// season-aware, best-scored first. Used by the WhatsApp gift concierge.
async function getGiftPicks({ budget = null, audiences = [], limit = 3 } = {}) {
  const ctx = getSeasonContext();
  const candidates = await loadCandidates();
  const scored = scoreAll(candidates, ctx, { audience: null, userId: null });

  const maxPrice = budget ? Number(budget) * 1.05 : null; // 5% tolerance

  let pool = scored.filter((s) => {
    if (stockOf(s.product) === 0) return false;
    if (maxPrice && s.price > maxPrice) return false;
    if (audiences.length) {
      const tags = s.tags || [];
      if (tags.length && !audiences.some((a) => tags.includes(a))) return false;
    }
    return true;
  });

  // audience-tagged products first, then score
  pool.sort((a, b) => {
    const aFit = audiences.length && a.tags?.some((t) => audiences.includes(t)) ? 1 : 0;
    const bFit = audiences.length && b.tags?.some((t) => audiences.includes(t)) ? 1 : 0;
    if (aFit !== bFit) return bFit - aFit;
    return b.score - a.score;
  });

  const picks = [];
  const usedCats = new Set();
  for (const relax of [false, true]) {
    for (const s of pool) {
      if (picks.length >= limit) break;
      if (picks.includes(s)) continue;
      const cat = String(s.product.category?._id || "none");
      if (!relax && usedCats.has(cat)) continue;
      picks.push(s);
      usedCats.add(cat);
    }
    if (picks.length >= limit) break;
  }

  return {
    context: { season: ctx.season, events: ctx.events.map((e) => ({ key: e.key, name: e.name })) },
    products: picks.map((s) => ({ ...s.product, priceFrom: s.price, tier: s.tier })),
  };
}

// Full scored catalog (no audience/user bias) — used by the WhatsApp
// concierge to run its own product-text matching on top of engine scores.
async function getScoredCatalog() {
  const ctx = getSeasonContext();
  const candidates = await loadCandidates();
  return scoreAll(candidates, ctx, { audience: null, userId: null });
}

module.exports = { getSmartRecommendations, getGiftPicks, getScoredCatalog, AUDIENCES };
