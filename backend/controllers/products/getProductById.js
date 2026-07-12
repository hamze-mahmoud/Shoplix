const mongoose = require("mongoose");
const Product = require("../../models/Product");

module.exports = async function getProductById(req, res) {
  // Reject a malformed id up front → 400, instead of letting the CastError
  // fall through to a generic 500 (and never leak err.message to clients).
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("getProductById error", err);
    res.status(500).json({ error: "Failed to load product" });
  }
};
