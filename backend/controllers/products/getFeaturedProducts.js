const Product = require("../../models/Product");
const { cache } = require("../../config/cache");
const attachRatings = require("../../utils/attachRatings");

const getFeaturedProducts = async (req, res) => {
  try {

    // 🔥 Query params
    const limit = parseInt(req.query.limit) || 8;

    // 🔥 Get featured products (cached — homepage hits this constantly)
    const products = await cache.getOrSet(`products:featured:${limit}`, 120, async () => {
      const found = await Product.find({ isFeatured: true })
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .limit(limit + 6) // fetch a few extra to backfill after filtering
        .lean();

      // Drop products hidden when sold out
      const visible = found
        .filter((p) => {
          const totalStock = (p.variants || []).reduce((s, v) => s + (v.stock || 0), 0);
          return !(p.hideWhenSoldOut && totalStock === 0);
        })
        .slice(0, limit);

      return attachRatings(visible);
    });

    // 🔥 Response
    res.status(200).json(products);

  } catch (error) {
    console.error("getFeaturedProducts error:", error);

    res.status(500).json({
      message: "Failed to fetch featured products",
      error: error.message,
    });
  }
};
module.exports=getFeaturedProducts;

