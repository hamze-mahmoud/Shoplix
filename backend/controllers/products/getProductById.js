const Product = require("../../models/Product");

module.exports = async function getProductById(req, res) {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category"
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
