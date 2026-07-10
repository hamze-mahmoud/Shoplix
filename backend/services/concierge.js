const { getGiftPicks, getScoredCatalog } = require("./recommendations");
const { sendText } = require("./whatsapp");

// ============================================================
// WhatsApp Shopping Concierge — the "brain" behind the inbound bot.
//
// Understands (in Arabic / Hebrew / English):
//   • product requests   — "بدي مكتب", "do you have a laptop under 2000?"
//   • gift requests      — "أريد هدية لأمي بميزانية 200 شيكل"
//   • browse questions   — "شو عندكم؟", "what do you sell?"
//   • greetings          — "مرحبا", "hi"
// and answers with real catalog matches (all 3 languages of product +
// category names), budget-capped, with helpful fallbacks when nothing
// matches exactly. Rule-based NLU always runs; when ANTHROPIC_API_KEY is
// set, Claude parses instead (silent fallback to rules).
// ============================================================

const SITE = () => process.env.FRONTEND_URL || "http://localhost:5173";

// ---- language detection (by script) ----
function detectLanguage(text) {
  if (/[֐-׿]/.test(text)) return "he";
  if (/[؀-ۿ]/.test(text)) return "ar";
  return "en";
}

// Arabic-Indic + Eastern digits → Latin
function normalizeDigits(text) {
  return text
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

// Normalize for matching: lowercase, unify Arabic letter forms, strip
// diacritics (Arabic harakat + Hebrew niqqud), tatweel and punctuation.
function normalizeText(text) {
  return normalizeDigits(String(text))
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // harakat + tatweel
    .replace(/[֑-ׇ]/g, "") // niqqud
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ---- vocabulary -------------------------------------------------------

// Filler words that never describe a product (normalized forms).
const STOPWORDS = new Set([
  // ar
  "اريد", "ابي", "ابغي", "بدي", "بديش", "محتاج", "محتاجه", "ممكن", "عندكم",
  "عندك", "هل", "يوجد", "في", "فيه", "لو", "سمحت", "من", "فضلك", "ابحث",
  "عن", "اشتري", "شراء", "اشتريت", "جديد", "جديده", "شي", "شيء", "اي",
  "على", "الى", "انا", "لي", "مع", "او", "و", "يا", "ان", "كم", "سعر",
  "بسعر", "تحت", "اقل", "اكثر", "حوالي", "تقريبا", "بحدود", "ضمن",
  "ميزانيه", "بميزانيه", "شيكل", "شيقل", "شيكلات", "دولار", "لمناسبه", "مناسبه",
  // en
  "i", "a", "an", "the", "want", "need", "would", "like", "do", "you",
  "have", "has", "there", "is", "are", "any", "some", "looking", "for",
  "buy", "get", "me", "my", "please", "new", "can", "of", "to", "and",
  "or", "in", "on", "at", "with", "under", "below", "less", "than",
  "around", "about", "budget", "price", "cost", "shekel", "shekels",
  "nis", "ils", "something", "what", "when", "where", "who", "why",
  "how", "much", "many", "time", "open", "opens", "close", "closed",
  "hour", "hours", "today", "tomorrow",
  "متى", "كيف", "وين", "اين", "ليش", "لماذا", "الساعه", "تفتحون", "تغلقون",
  "מתי", "איך", "איפה", "למה", "פתוחים", "סגורים",
  // he
  "אני", "רוצה", "צריך", "צריכה", "מחפש", "מחפשת", "יש", "לכם", "לך",
  "אפשר", "בבקשה", "לקנות", "קניתי", "חדש", "חדשה", "משהו", "איזה",
  "כמה", "עולה", "מחיר", "תקציב", "בתקציב", "מתחת", "פחות", "בערך",
  "עד", "שקל", "שקלים", "של", "עם", "או", "לי", "את", "זה",
]);

// Tokens that describe WHO the item is for / the occasion — they route to
// gift logic and must not leak into the product query.
// Arabic: whole normalized token with optional ال/ل/لل/و prefix + possessive suffix.
const AR_PERSON_RX =
  /^(ال|لل|ل|و)?(ام|اب|ماما|بابا|والد|والده|جد|جده|ستي|سيدي|زوج|زوجه|اخ|اخت|ابن|ابني|بنت|طفل|اطفال|بيبي|صديق|صديقه|حبيب|حبيبه|خطيب|خطيبه|شاب|مراهق|هديه|هدايا|عيد|ميلاد|زواج|عرس|زفاف|تخرج)(ي|ه|تي|ته|نا|كم|هم|ها|ات|ين|تين)?$/;
const EN_PERSON = new Set([
  "mom", "mother", "dad", "father", "wife", "husband", "sister", "brother",
  "son", "daughter", "kid", "child", "children", "baby", "grandma",
  "grandpa", "grandmother", "grandfather", "friend", "girlfriend",
  "boyfriend", "fiance", "fiancee", "gift", "present", "birthday",
  "wedding", "graduation", "teen", "teenager", "young",
]);
const HE_PERSON = new Set([
  "אמא", "אימא", "אבא", "סבתא", "סבא", "אח", "אחות", "בן", "בת", "ילד",
  "ילדה", "ילדים", "תינוק", "מתנה", "חבר", "חברה", "אשתי", "בעלי",
  "הולדת", "חתונה", "לאמא", "לאבא", "שלי",
]);

// Cross-language product synonyms (normalized). A query token that hits a
// group searches the catalog with every variant in that group.
const SYN_GROUPS = [
  ["مكتب", "مكاتب", "desk", "desks", "office", "מכתבה", "שולחן כתיבה"],
  ["كرسي", "كراسي", "مقعد", "مقاعد", "chair", "chairs", "seat", "bench", "כיסא", "כסא", "ספסל"],
  ["كنبه", "كنب", "اريكه", "صوفا", "sofa", "couch", "ספה"],
  ["طاوله", "طاولات", "table", "tables", "שולחן"],
  ["هاتف", "هواتف", "جوال", "جوالات", "موبايل", "تلفون", "phone", "phones", "smartphone", "טלפון", "פלאפון"],
  ["لابتوب", "حاسوب", "كمبيوتر", "laptop", "laptops", "computer", "notebook", "מחשב", "לפטופ"],
  ["سماعه", "سماعات", "headphone", "headphones", "earbuds", "earphones", "אוזניות"],
  ["مكبر", "مكبرات", "سبيكر", "speaker", "speakers", "רמקול", "רמקולים"],
  ["ساعه", "ساعات", "watch", "watches", "smartwatch", "שעון"],
  ["عصاره", "خلاط", "juicer", "blender", "מסחטה", "בלנדר"],
  ["خيمه", "خيم", "tent", "tents", "camping", "אוהל", "קמפינג"],
  ["حديقه", "جنينه", "garden", "outdoor", "patio", "גינה", "גן", "חצר"],
  ["مصباح", "اضاءه", "لمبه", "lamp", "light", "lighting", "מנורה", "תאורה"],
  ["اثاث", "furniture", "רהיטים"],
].map((g) => g.map(normalizeText));

const GREETING = /^(hi|hello|hey|مرحبا|هاي|اهلا|أهلا|سلام|السلام عليكم|صباح الخير|مساء الخير|שלום|היי|בוקר טוב)[\s!.؟?]*$/i;
const BROWSE_RX =
  /(شو|ايش|وش|ماذا)\s+(عندكم|عندك|تبيعون|يوجد|لديكم)|منتجاتكم|اقسام|what\s+do\s+you\s+(sell|have)|show\s+me\s+(your\s+)?products|מה\s+יש\s+לכם|מה\s+אתם\s+מוכרים/i;
const GIFT_WORDS = /هدي|gift|present|מתנה/i;

// ---- recipient → audience tags (raw text, before normalization) ----
const RECIPIENTS = [
  { rx: /أم|ام(ي|نا)|ماما|والدت|mom|mother|אמא|אימא/i, audiences: ["women", "elderly"], key: "mom" },
  { rx: /أب|اب(ي|ونا)|بابا|والد(?!ت)|dad|father|אבא/i, audiences: ["men", "elderly"], key: "dad" },
  { rx: /جد|ست(ي|و)|سيد(ي|و)|grandm|grandp|סבתא|סבא/i, audiences: ["elderly"], key: "grandparent" },
  { rx: /زوجت|أخت|اخت|صديقت|حبيبت|خطيبت|wife|sister|girlfriend|fiancee|אשתי|אחות|חברה שלי/i, audiences: ["women"], key: "woman" },
  { rx: /زوج(?!ت)|أخ(?!ت)|اخ(?!ت)|صديق(?!ت)|حبيب(?!ت)|خطيب(?!ت)|husband|brother|boyfriend|fiance\b|בעלי|אח שלי|חבר שלי/i, audiences: ["men"], key: "man" },
  { rx: /ابن|ولد|طفل|بنت(ي|ه)|أطفال|اطفال|بيبي|son|daughter|kid|child|baby|בן שלי|בת שלי|ילד|תינוק/i, audiences: ["kids"], key: "child" },
  { rx: /شاب|مراهق|صبي|teen|young|נער|צעיר/i, audiences: ["young"], key: "young" },
];

const OCCASIONS = [
  { rx: /عيد ميلاد|birthday|יום הולדת/i, key: "birthday" },
  { rx: /زواج|عرس|زفاف|wedding|חתונה/i, key: "wedding" },
  { rx: /تخرج|graduat|סיום לימודים/i, key: "graduation" },
  { rx: /عيد الأم|mother'?s day|יום האם/i, key: "mothers_day" },
  { rx: /عيد|eid|חג/i, key: "eid" },
];

// ---- rule-based intent parsing ----------------------------------------

function extractBudget(text) {
  const t = normalizeDigits(text);
  const cur = t.match(/(\d[\d,.]*)\s*(?:شيكل|شيقل|₪|شيكلات|ils|nis|shekel|ش\.ج|ש"ח|שקל)/i);
  if (cur) return parseFloat(cur[1].replace(/,/g, ""));
  const any = t.match(/(\d[\d,.]{0,8})/);
  return any ? parseFloat(any[1].replace(/,/g, "")) : null;
}

function isPersonToken(token) {
  return AR_PERSON_RX.test(token) || EN_PERSON.has(token) || HE_PERSON.has(token);
}

// Product-describing tokens = everything minus filler/budget/person words.
function extractProductTokens(rawText) {
  const norm = normalizeText(rawText);
  return norm
    .split(" ")
    .map((t) => (t.length > 3 && /^[a-z]+s$/.test(t) ? t.slice(0, -1) : t)) // naive EN plural
    .filter(
      (t) =>
        t.length >= 2 &&
        !/^\d+$/.test(t) &&
        !STOPWORDS.has(t) &&
        !isPersonToken(t)
    );
}

function parseIntentRules(rawText) {
  const text = normalizeDigits(rawText);
  if (GREETING.test(text.trim())) return { type: "greeting" };
  if (BROWSE_RX.test(text)) return { type: "browse" };

  const budget = extractBudget(text);

  let audiences = [];
  let recipientKey = null;
  for (const r of RECIPIENTS) {
    if (r.rx.test(text)) {
      audiences = r.audiences;
      recipientKey = r.key;
      break;
    }
  }

  let occasion = null;
  for (const o of OCCASIONS) {
    if (o.rx.test(text)) { occasion = o.key; break; }
  }

  const isGift = GIFT_WORDS.test(text) || recipientKey !== null;
  const tokens = extractProductTokens(text);

  if (tokens.length) {
    return { type: "product", tokens, budget, audiences, recipientKey, occasion, isGift };
  }
  if (isGift || budget) {
    return { type: "gift", budget, audiences, recipientKey, occasion };
  }
  return { type: "unknown" };
}

// ---- catalog matching --------------------------------------------------

function expandToken(token) {
  const variants = new Set([token]);
  for (const group of SYN_GROUPS) {
    const hit = group.some(
      (v) =>
        v === token ||
        (token.length >= 3 && v.startsWith(token)) ||
        (v.length >= 3 && token.startsWith(v))
    );
    if (hit) group.forEach((v) => variants.add(v));
  }
  return [...variants];
}

function searchableFields(p) {
  const tr = p.translations || {};
  const cat = p.category || {};
  const ctr = cat.translations || {};
  return {
    name: normalizeText(
      [p.name, tr.en?.name, tr.ar?.name, tr.he?.name].filter(Boolean).join(" ")
    ),
    category: normalizeText(
      [cat.name, ctr.en?.name, ctr.ar?.name, ctr.he?.name].filter(Boolean).join(" ")
    ),
    desc: normalizeText(
      [p.description, tr.en?.description, tr.ar?.description, tr.he?.description]
        .filter(Boolean)
        .join(" ")
    ),
  };
}

// Returns { within: [...], over: [...] } — matches inside the budget and
// (when budget excluded everything) the closest matches above it.
// Latin terms match on word boundaries ("phone" must not hit "headphones");
// Arabic/Hebrew keep substring matching (prefixes/suffixes attach to words).
function fieldHas(text, v) {
  if (/^[a-z0-9 ]+$/.test(v)) {
    return new RegExp(`(?<![a-z0-9])${v}(s|es)?(?![a-z0-9])`).test(text);
  }
  return text.includes(v);
}

function matchProducts(tokens, scored, { budget = null, audiences = [], limit = 3 } = {}) {
  const maxPrice = budget ? Number(budget) * 1.05 : null;
  const inStock = scored.filter((s) => (s.product.variants || []).some((v) => (v.stock || 0) > 0));

  const rated = [];
  for (const s of inStock) {
    const f = searchableFields(s.product);
    let matchScore = 0;
    for (const token of tokens) {
      for (const v of expandToken(token)) {
        if (fieldHas(f.name, v)) { matchScore += 3; break; }
        if (fieldHas(f.category, v)) { matchScore += 2; break; }
        if (fieldHas(f.desc, v)) { matchScore += 1; break; }
      }
    }
    if (matchScore > 0) rated.push({ ...s, matchScore });
  }

  // when name/category matches exist, drop weak description-only hits
  const best = Math.max(0, ...rated.map((r) => r.matchScore));
  const strong = best >= 2 ? rated.filter((r) => r.matchScore >= 2) : rated;

  strong.sort((a, b) => {
    if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
    const aFit = audiences.length && a.tags?.some((t) => audiences.includes(t)) ? 1 : 0;
    const bFit = audiences.length && b.tags?.some((t) => audiences.includes(t)) ? 1 : 0;
    if (aFit !== bFit) return bFit - aFit;
    return b.score - a.score;
  });

  const within = maxPrice ? strong.filter((s) => s.price <= maxPrice) : strong;
  const over = maxPrice ? strong.filter((s) => s.price > maxPrice) : [];
  return { within: within.slice(0, limit), over: over.slice(0, 2) };
}

// ---- optional Claude NLU (silent fallback to rules) ----
async function parseIntentClaude(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": apiKey, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 250,
      messages: [{
        role: "user",
        content:
          `Parse this e-commerce WhatsApp message (Arabic/Hebrew/English). Reply ONLY JSON:\n` +
          `{"type":"greeting"|"product"|"gift"|"browse"|"unknown","budget":number|null,` +
          `"audiences":subset of ["kids","young","women","men","elderly"],` +
          `"productQuery":"the product/category words in the original language, or empty",` +
          `"occasion":string|null}\n` +
          `type=product when a specific product/category is mentioned (even inside a gift request); ` +
          `type=browse when asking what the shop sells.\n\nMessage: ${text}`,
      }],
    }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`anthropic ${res.status}`);
  const data = await res.json();
  const t = data.content?.map((c) => c.text || "").join("") || "";
  const parsed = JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
  if (parsed.type === "product") {
    parsed.tokens = extractProductTokens(parsed.productQuery || "");
    if (!parsed.tokens.length) parsed.type = parsed.budget || (parsed.audiences || []).length ? "gift" : "unknown";
  }
  return parsed;
}

// ---- localized reply templates ----
const T = {
  en: {
    greeting: (site) =>
      `👋 Welcome to Shoplix!\nI'm your shopping assistant. Tell me what you're looking for — a product, or a gift with a budget:\n\n"Do you have a desk?"\n"Gift for my mom, budget 200 shekels"\n\n🛍️ Or browse: ${site}`,
    unknown: (site) =>
      `🤔 I didn't quite get that. Try:\n"Do you have a desk?" or "Gift for my dad, 150 ₪"\n\n🛍️ Browse everything: ${site}`,
    giftIntro: (b) => `🎁 My top picks${b ? ` under ₪${b}` : ""}:`,
    foundIntro: (b) => `🔎 Here's what I found for you${b ? ` under ₪${b}` : ""}:`,
    overIntro: () => `💡 The closest matches are a bit above your budget:`,
    notFound: (site) => `😕 I couldn't find exactly that in our store right now. You might like these instead:`,
    browseIntro: () => `🛍️ Here's what we sell:`,
    more: (site) => `✨ More ideas: ${site}/tailored`,
    browse: (site) => `Browse everything: ${site}/products`,
    empty: (site) => `😕 I couldn't find matching items in that budget. Try a different budget, or browse: ${site}/tailored`,
  },
  ar: {
    greeting: (site) =>
      `👋 أهلاً بك في Shoplix!\nأنا مساعدك للتسوق. أخبرني عمّا تبحث — منتج معيّن، أو هدية مع ميزانية:\n\n"عندكم مكاتب؟"\n"أريد هدية لأمي بميزانية 200 شيكل"\n\n🛍️ أو تصفح المتجر: ${site}`,
    unknown: (site) =>
      `🤔 لم أفهم طلبك تماماً. جرّب مثلاً:\n"عندكم مكاتب؟" أو "هدية لأبي بميزانية 150 شيكل"\n\n🛍️ تصفح كل المنتجات: ${site}`,
    giftIntro: (b) => `🎁 أفضل اختياراتي${b ? ` ضمن ₪${b}` : ""}:`,
    foundIntro: (b) => `🔎 هذا ما وجدته لك${b ? ` ضمن ₪${b}` : ""}:`,
    overIntro: () => `💡 أقرب المنتجات لطلبك أعلى قليلاً من ميزانيتك:`,
    notFound: (site) => `😕 لم أجد هذا المنتج بالضبط في متجرنا حالياً، لكن قد تعجبك هذه:`,
    browseIntro: () => `🛍️ هذه أقسام متجرنا:`,
    more: (site) => `✨ المزيد من الأفكار: ${site}/tailored`,
    browse: (site) => `تصفح كل المنتجات: ${site}/products`,
    empty: (site) => `😕 لم أجد منتجات مناسبة ضمن هذه الميزانية. جرّب ميزانية أخرى أو تصفح: ${site}/tailored`,
  },
  he: {
    greeting: (site) =>
      `👋 ברוכים הבאים ל-Shoplix!\nאני עוזר הקניות שלכם. ספרו לי מה אתם מחפשים — מוצר, או מתנה עם תקציב:\n\n"יש לכם שולחן כתיבה?"\n"מתנה לאמא, תקציב 200 שקל"\n\n🛍️ או גלשו: ${site}`,
    unknown: (site) =>
      `🤔 לא הבנתי לגמרי. נסו:\n"יש לכם שולחן?" או "מתנה לאבא, 150 ₪"\n\n🛍️ לכל המוצרים: ${site}`,
    giftIntro: (b) => `🎁 הבחירות שלי${b ? ` עד ₪${b}` : ""}:`,
    foundIntro: (b) => `🔎 הנה מה שמצאתי בשבילכם${b ? ` עד ₪${b}` : ""}:`,
    overIntro: () => `💡 ההתאמות הקרובות ביותר קצת מעל התקציב:`,
    notFound: (site) => `😕 לא מצאתי בדיוק את זה כרגע, אבל אולי תאהבו את אלה:`,
    browseIntro: () => `🛍️ הנה מה שיש לנו:`,
    more: (site) => `✨ עוד רעיונות: ${site}/tailored`,
    browse: (site) => `לכל המוצרים: ${site}/products`,
    empty: (site) => `😕 לא מצאתי פריטים מתאימים בתקציב. נסו תקציב אחר או גלשו: ${site}/tailored`,
  },
};

const localName = (p, lang) => p.translations?.[lang]?.name || p.name;
const localCatName = (c, lang) => c?.translations?.[lang]?.name || c?.name;

// picks: [{ product, price }] — shared numbered-list builder
function buildListReply(lang, intro, picks, { footer } = {}) {
  const site = SITE();
  const t = T[lang] || T.en;
  const lines = [intro];
  picks.forEach(({ product, price }, i) => {
    lines.push(`\n${i + 1}) ${localName(product, lang)} — ₪${price}`);
    lines.push(`${site}/products/${product._id}`);
  });
  lines.push(`\n${footer || t.more(site)}`);
  return lines.join("\n");
}

// ---- main entry -------------------------------------------------------
// Returns { reply, intent, lang }. Sends the reply via WhatsApp unless dryRun.
async function handleIncomingMessage({ from, text, dryRun = false }) {
  const lang = detectLanguage(text || "");
  const t = T[lang] || T.en;
  const site = SITE();

  let intent = null;
  try {
    intent = await parseIntentClaude(text);
  } catch { /* fall back to rules */ }
  if (!intent) intent = parseIntentRules(text || "");

  let reply;

  if (intent.type === "greeting") {
    reply = t.greeting(site);

  } else if (intent.type === "browse") {
    const scored = await getScoredCatalog();
    const cats = new Map();
    for (const s of scored) {
      const c = s.product.category;
      if (c && !cats.has(String(c._id))) cats.set(String(c._id), localCatName(c, lang));
    }
    reply = [
      t.browseIntro(),
      ...[...cats.values()].map((n) => `• ${n}`),
      ``,
      t.browse(site),
    ].join("\n");

  } else if (intent.type === "product") {
    const scored = await getScoredCatalog();
    const { within, over } = matchProducts(intent.tokens, scored, {
      budget: intent.budget,
      audiences: intent.audiences || [],
      limit: 3,
    });

    if (within.length) {
      const intro = intent.isGift ? t.giftIntro(intent.budget) : t.foundIntro(intent.budget);
      reply = buildListReply(lang, intro, within);
    } else if (over.length) {
      reply = buildListReply(lang, t.overIntro(), over);
    } else {
      // nothing matched the words — offer popular in-budget alternatives
      const { products } = await getGiftPicks({
        budget: intent.budget,
        audiences: intent.audiences || [],
        limit: 3,
      });
      reply = products.length
        ? buildListReply(
            lang,
            t.notFound(site),
            products.map((p) => ({ product: p, price: p.priceFrom }))
          )
        : t.empty(site);
    }

  } else if (intent.type === "gift") {
    const { products } = await getGiftPicks({
      budget: intent.budget,
      audiences: intent.audiences || [],
      limit: 3,
    });
    reply = products.length
      ? buildListReply(
          lang,
          t.giftIntro(intent.budget),
          products.map((p) => ({ product: p, price: p.priceFrom }))
        )
      : t.empty(site);

  } else {
    reply = t.unknown(site);
  }

  if (!dryRun && from) {
    try {
      await sendText(from, reply);
    } catch (e) {
      console.error("concierge sendText failed:", e.message);
    }
  }

  return { reply, intent, lang };
}

module.exports = { handleIncomingMessage, parseIntentRules, detectLanguage, normalizeText };
