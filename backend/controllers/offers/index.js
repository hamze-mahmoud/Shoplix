const mongoose = require("mongoose");
const BundleOffer = require("../../models/BundleOffer");
const { resolveBundle } = require("../../utils/resolveBundle");
const { parseTranslations, deriveCanonical } = require("../../utils/i18nFields");
const { maybeAnnounceOffer } = require("../../utils/notifyOffer");

const OFFER_TEXT_FIELDS = ["title", "description"];

const STATUSES = ["draft", "active", "inactive"];

// Live-offer filter: active AND now within [startDate, endDate]. Expired
// offers auto-hide because endDate must be >= now — no cron job required.
const liveQuery = () => {
  const now = new Date();
  return { status: "active", startDate: { $lte: now }, endDate: { $gte: now } };
};

// Deep-populate the pinned products so resolveBundle can read variants.
const withProducts = (q) => q.populate({ path: "items.product" });

// ---- Parse the (multipart) admin form body into a clean offer payload ----
function readPayload(req) {
  const body = req.body || {};

  // Localized title/description (en/ar/he). Canonical values are derived from
  // the translations (en → ar → he), falling back to any flat title/description.
  const translations = parseTranslations(body.translations, OFFER_TEXT_FIELDS);
  const canonical = deriveCanonical(
    translations,
    { title: body.title, description: body.description },
    OFFER_TEXT_FIELDS
  );

  // items come as a JSON string in multipart form data
  let items = [];
  try {
    const raw = typeof body.items === "string" ? JSON.parse(body.items) : body.items;
    if (Array.isArray(raw)) {
      items = raw
        .filter((it) => it && it.product && it.variantId)
        .map((it) => ({
          product: it.product,
          variantId: it.variantId,
          quantity: Math.max(1, Number(it.quantity) || 1),
        }));
    }
  } catch {
    items = [];
  }

  // Newly uploaded images (Cloudinary) + any kept existing image URLs.
  const uploaded = (req.files || []).map((f) => f.path);
  let kept = [];
  try {
    const raw = typeof body.existingImages === "string" ? JSON.parse(body.existingImages) : body.existingImages;
    if (Array.isArray(raw)) kept = raw.filter((u) => typeof u === "string");
  } catch {
    kept = [];
  }
  const images = [...kept, ...uploaded];

  return {
    translations, // { en/ar/he: { title, description } } or null
    title: canonical.title || undefined,
    description: canonical.description || undefined,
    items,
    images,
    offerPrice: body.offerPrice !== undefined ? Number(body.offerPrice) : undefined,
    startDate: body.startDate ? new Date(body.startDate) : undefined,
    endDate: body.endDate ? new Date(body.endDate) : undefined,
    status: STATUSES.includes(body.status) ? body.status : undefined,
  };
}

// ================= PUBLIC =================

// GET /api/offers — live offers only, resolved for display
async function getActiveOffers(req, res) {
  try {
    const offers = await withProducts(BundleOffer.find(liveQuery()).sort({ createdAt: -1 }));
    const data = offers.map(resolveBundle).filter(Boolean);
    res.json({ success: true, data });
  } catch (err) {
    console.error("getActiveOffers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/offers/:id — a single live offer
async function getOfferById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }
    const offer = await withProducts(
      BundleOffer.findOne({ _id: req.params.id, ...liveQuery() })
    );
    const data = resolveBundle(offer);
    if (!data) {
      return res.status(404).json({ success: false, message: "Offer not found" });
    }
    res.json({ success: true, data });
  } catch (err) {
    console.error("getOfferById error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// ================= ADMIN =================

// GET /api/admin/offers — all offers (any status), resolved for the list
async function adminGetOffers(req, res) {
  try {
    const offers = await withProducts(BundleOffer.find().sort({ createdAt: -1 }));
    // Resolve for display but keep even "broken" offers visible to the admin.
    const data = offers.map((o) => {
      const resolved = resolveBundle(o) || {
        _id: o._id,
        title: o.title,
        images: o.images,
        offerPrice: o.offerPrice,
        products: [],
        inStock: false,
      };
      return {
        ...resolved,
        status: o.status,
        startDate: o.startDate,
        endDate: o.endDate,
        rawItems: o.items, // ids for editing
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    console.error("adminGetOffers error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/admin/offers/:id — raw offer for editing
async function adminGetOffer(req, res) {
  try {
    const offer = await BundleOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });
    res.json({ success: true, data: offer });
  } catch (err) {
    console.error("adminGetOffer error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// POST /api/admin/offers
async function createOffer(req, res) {
  try {
    const p = readPayload(req);

    if (!p.title) return res.status(400).json({ success: false, message: "Title is required" });
    if (!p.items || p.items.length === 0)
      return res.status(400).json({ success: false, message: "Add at least one product to the bundle" });
    if (!(p.offerPrice >= 0))
      return res.status(400).json({ success: false, message: "A valid offer price is required" });
    if (!p.startDate || !p.endDate || isNaN(p.startDate) || isNaN(p.endDate))
      return res.status(400).json({ success: false, message: "Start and end dates are required" });
    if (p.endDate <= p.startDate)
      return res.status(400).json({ success: false, message: "End date must be after start date" });

    const offer = await BundleOffer.create({
      title: p.title,
      description: p.description || "",
      translations: p.translations || undefined,
      items: p.items,
      images: p.images,
      offerPrice: p.offerPrice,
      startDate: p.startDate,
      endDate: p.endDate,
      status: p.status || "draft",
    });

    // Created straight into a live state → tell every customer (once).
    await maybeAnnounceOffer(req.app.get("io"), offer);

    res.status(201).json({ success: true, data: offer });
  } catch (err) {
    console.error("createOffer error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/admin/offers/:id
async function updateOffer(req, res) {
  try {
    const offer = await BundleOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });

    const p = readPayload(req);

    if (p.title !== undefined) offer.title = p.title;
    if (p.description !== undefined) offer.description = p.description;
    // Only overwrite translations when the form actually sent them (a
    // status-only quick update must not wipe existing localized text).
    if (p.translations) offer.translations = p.translations;
    if (p.items && p.items.length) offer.items = p.items;
    // images always come back as the full desired set (kept + uploaded)
    if (req.files?.length || p.images.length || req.body.existingImages !== undefined) {
      offer.images = p.images;
    }
    if (p.offerPrice !== undefined && p.offerPrice >= 0) offer.offerPrice = p.offerPrice;
    if (p.startDate && !isNaN(p.startDate)) offer.startDate = p.startDate;
    if (p.endDate && !isNaN(p.endDate)) offer.endDate = p.endDate;
    if (p.status) offer.status = p.status;

    if (offer.endDate <= offer.startDate)
      return res.status(400).json({ success: false, message: "End date must be after start date" });

    await offer.save();

    // If this edit made the offer live for the first time (e.g. draft →
    // active), announce it to customers. No-op on already-announced offers.
    await maybeAnnounceOffer(req.app.get("io"), offer);

    res.json({ success: true, data: offer });
  } catch (err) {
    console.error("updateOffer error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/admin/offers/:id
async function deleteOffer(req, res) {
  try {
    const offer = await BundleOffer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: "Offer not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("deleteOffer error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getActiveOffers,
  getOfferById,
  adminGetOffers,
  adminGetOffer,
  createOffer,
  updateOffer,
  deleteOffer,
};
