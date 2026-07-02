const Banner = require("../../models/Banner");
const { parseTranslations, deriveCanonical } = require("../../utils/i18nFields");

const FIELDS = ["kicker", "title", "title2", "subtitle", "cta"];

// GET /api/banners — public: active banners for the homepage slider
async function getActiveBanners(req, res) {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("getActiveBanners error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// GET /api/admin/banners — all banners (incl. inactive) for management
async function adminGetBanners(req, res) {
  try {
    const banners = await Banner.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    console.error("adminGetBanners error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Shared: pull banner fields out of a (multipart) request body
function readPayload(req) {
  const translations = parseTranslations(req.body.translations, FIELDS);
  const canonical = deriveCanonical(translations, {}, FIELDS);
  // uploaded file (Cloudinary) wins; otherwise an explicit image URL
  const image = req.file?.path || req.body.imageUrl || undefined;
  const order = req.body.order !== undefined ? Number(req.body.order) || 0 : undefined;
  const active =
    req.body.active !== undefined
      ? req.body.active === true || req.body.active === "true"
      : undefined;
  const link = req.body.link !== undefined ? String(req.body.link).trim() : undefined;
  return { translations, canonical, image, order, active, link };
}

// POST /api/admin/banners
async function createBanner(req, res) {
  try {
    const { translations, canonical, image, order, active, link } = readPayload(req);

    if (!image) {
      return res.status(400).json({ success: false, message: "Banner image is required" });
    }
    if (!translations || !canonical.title) {
      return res.status(400).json({ success: false, message: "A title is required in at least one language" });
    }

    const banner = await Banner.create({
      image,
      translations,
      title: canonical.title,
      subtitle: canonical.subtitle,
      link: link || "/products",
      order: order ?? 0,
      active: active ?? true,
    });

    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    console.error("createBanner error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// PUT /api/admin/banners/:id
async function updateBanner(req, res) {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    const { translations, canonical, image, order, active, link } = readPayload(req);

    if (image) banner.image = image; // keep the old image when none supplied
    if (translations) {
      banner.translations = translations;
      banner.title = canonical.title || banner.title;
      banner.subtitle = canonical.subtitle;
    }
    if (link !== undefined) banner.link = link || "/products";
    if (order !== undefined) banner.order = order;
    if (active !== undefined) banner.active = active;

    await banner.save();
    res.json({ success: true, data: banner });
  } catch (err) {
    console.error("updateBanner error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/admin/banners/:id
async function deleteBanner(req, res) {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("deleteBanner error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getActiveBanners, adminGetBanners, createBanner, updateBanner, deleteBanner };
