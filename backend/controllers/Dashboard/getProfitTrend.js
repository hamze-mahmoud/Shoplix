const Order = require("../../models/Order");
const { cache } = require("../../config/cache");
const { getDateRange } = require("../../utils/dateRange");
const { DEFAULT_COST_RATIO } = require("../../config/finance");

const cogsExpr = {
  $sum: {
    $map: {
      input: "$items",
      as: "it",
      in: {
        $multiply: [
          { $ifNull: ["$$it.cost", { $multiply: ["$$it.price", DEFAULT_COST_RATIO] }] },
          { $ifNull: ["$$it.quantity", 1] },
        ],
      },
    },
  },
};

const round = (n) => Math.round((n || 0) * 100) / 100;

const getProfitTrend = async (req, res) => {
  try {
    const { period = "30d", from, to, granularity: gOverride } = req.query;
    const { start, end, granularity } = getDateRange(period, from, to);
    const unit = ["day", "week", "month", "year"].includes(gOverride) ? gOverride : granularity;

    const cacheKey = `dashboard:fin:trend:${period}:${unit}:${from || ""}:${to || ""}`;

    const data = await cache.getOrSet(cacheKey, 120, async () => {
      const rows = await Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateTrunc: { date: "$createdAt", unit } },
            revenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
            cogs: { $sum: cogsExpr },
            shipping: { $sum: { $ifNull: ["$shippingCost", 0] } },
            discount: { $sum: { $ifNull: ["$discount", 0] } },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      return rows.map((r) => {
        const grossProfit = r.revenue - r.cogs;
        const netProfit = grossProfit - r.shipping - r.discount;
        return {
          date: r._id,
          revenue: round(r.revenue),
          cogs: round(r.cogs),
          grossProfit: round(grossProfit),
          netProfit: round(netProfit),
          orders: r.orders,
        };
      });
    });

    res.json({ granularity: unit, points: data });
  } catch (err) {
    console.error("getProfitTrend error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getProfitTrend;
