const Product = require("../../models/Product");
const { cache } = require("../../config/cache");

// GET /api/dashboard/analytics/low-stock?threshold=5 — products at or below
// a stock threshold, lowest first (inventory alerts).
const getLowStock = async (req, res) => {
  try {
    const threshold = Math.max(0, parseInt(req.query.threshold, 10) || 5);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const cacheKey = `dashboard:lowstock:${threshold}:${limit}`;

    const data = await cache.getOrSet(cacheKey, 60, async () => {
      return Product.aggregate([
        { $addFields: { totalStock: { $sum: "$variants.stock" } } },
        { $match: { totalStock: { $lte: threshold } } },
        { $sort: { totalStock: 1, name: 1 } },
        { $limit: limit },
        {
          $lookup: { from: "categories", localField: "category", foreignField: "_id", as: "cat" },
        },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: 1,
            totalStock: 1,
            basePrice: 1,
            category: { $ifNull: ["$cat.name", "Uncategorized"] },
            image: { $first: { $ifNull: [{ $first: "$variants.images" }, []] } },
          },
        },
      ]);
    });

    res.json(data);
  } catch (err) {
    console.error("getLowStock error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getLowStock;
