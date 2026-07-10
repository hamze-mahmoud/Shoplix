const Order = require("../../models/Order");
const { cache } = require("../../config/cache");
const attachRatings = require("../../utils/attachRatings");

/**
 * Best sellers = products ranked by total units sold across non-cancelled
 * orders. Computed in a single aggregation; cached for 2 minutes.
 * Falls back to newest products when there are no sales yet.
 */
const getBestSellers = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 24);

    const products = await cache.getOrSet(`products:bestsellers:${limit}`, 120, async () => {
      const ranked = await Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productName",
            sold: { $sum: { $ifNull: ["$items.quantity", 1] } },
            image: { $first: "$items.productImage" },
          },
        },
        { $sort: { sold: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "name",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
        {
          $project: {
            _id: "$product._id",
            name: "$product.name",
            translations: "$product.translations",
            basePrice: "$product.basePrice",
            variants: "$product.variants",
            category: "$product.category",
            sold: 1,
            image: 1,
          },
        },
      ]);

      // Populate category names
      await Order.db.model("Product").populate(ranked, { path: "category", select: "name translations" });

      // Fallback: if no sales data, surface newest products
      if (ranked.length === 0) {
        const Product = Order.db.model("Product");
        const newest = await Product.find()
          .populate("category", "name translations")
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();
        return attachRatings(newest.map((p) => ({ ...p, sold: 0 })));
      }

      return attachRatings(ranked);
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("getBestSellers error:", error);
    res.status(500).json({ message: "Failed to fetch best sellers", error: error.message });
  }
};

module.exports = getBestSellers;
