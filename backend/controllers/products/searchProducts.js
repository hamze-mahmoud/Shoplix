const Product = require("../../models/Product");

const searchProducts = async (req, res) => {
  console.log("hello")
  try {
    const { keyword = "", color, page = 1, limit = 10 } = req.query;

    const filter = {};

    // 🔍 multilingual text search — matches canonical + en/ar/he name & description
    if (keyword) {
      const rx = { $regex: keyword.trim(), $options: "i" };
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

    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .populate("category", "name translations")
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = searchProducts;