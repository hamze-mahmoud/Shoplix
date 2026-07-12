const Product = require("../../models/Product");

// Escape regex metacharacters so user input can't inject a pattern or trigger
// catastrophic backtracking (ReDoS). Never build a $regex from raw input.
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const searchProducts = async (req, res) => {
  try {
    const { keyword = "", color, page = 1, limit = 10 } = req.query;

    // clamp pagination so a huge ?limit can't be used to exhaust the server
    const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);
    const safePage = Math.max(parseInt(page, 10) || 1, 1);

    const filter = {};

    // 🔍 multilingual text search — matches canonical + en/ar/he name & description.
    // Latin terms match on a word boundary (so "phone" doesn't hit "headphones");
    // Arabic/Hebrew keep substring matching (prefixes/suffixes attach to words).
    if (keyword.trim()) {
      const safe = escapeRegex(keyword.trim());
      const pattern = /^[a-z0-9 ]+$/i.test(keyword.trim()) ? `\\b${safe}` : safe;
      const rx = { $regex: pattern, $options: "i" };
      filter.$or = [
        { name: rx },
        { description: rx },
        { "translations.en.name": rx },
        { "translations.ar.name": rx },
        { "translations.he.name": rx },
        { "translations.en.description": rx },
        { "translations.ar.description": rx },
        { "translations.he.description": rx },
      ];
    }

    // 🎨 variant filter
    if (color) {
      filter["variants.color"] = color;
    }

    const page_ = safePage;
    const limit_ = safeLimit;
    const skip = (page_ - 1) * limit_;

    const products = await Product.find(filter)
      .populate("category", "name translations")
      .skip(skip)
      .limit(limit_)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      total,
      page: page_,
      pages: Math.ceil(total / limit_),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = searchProducts;