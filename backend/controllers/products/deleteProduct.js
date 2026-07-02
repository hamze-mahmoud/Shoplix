const Product = require("../../models/Product");
const { cache } = require("../../config/cache");

module.exports = async function deleteProduct(req, res) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await cache.delByPrefix("products:"); // invalidate product caches

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
