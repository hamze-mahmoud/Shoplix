const Order = require("../../models/Order");
const { cache } = require("../../config/cache");
const { getDateRange } = require("../../utils/dateRange");

// GET /api/dashboard/analytics/categories — revenue / units / orders per
// category over a period. Joins order items → products → categories.
const getCategoryAnalytics = async (req, res) => {
  try {
    const { period = "30d", from, to } = req.query;
    const { start, end } = getDateRange(period, from, to);
    const cacheKey = `dashboard:cats:${period}:${from || ""}:${to || ""}`;

    const data = await cache.getOrSet(cacheKey, 120, async () => {
      return Order.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: start, $lte: end } } },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.productName",
            foreignField: "name",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: "$product.category",
            revenue: { $sum: { $multiply: ["$items.price", { $ifNull: ["$items.quantity", 1] }] } },
            units: { $sum: { $ifNull: ["$items.quantity", 1] } },
            orders: { $addToSet: "$_id" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            categoryId: "$_id",
            name: { $ifNull: ["$cat.name", "Uncategorized"] },
            revenue: { $round: ["$revenue", 2] },
            units: 1,
            orders: { $size: "$orders" },
          },
        },
        { $sort: { revenue: -1 } },
      ]);
    });

    res.json(data);
  } catch (err) {
    console.error("getCategoryAnalytics error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getCategoryAnalytics;
