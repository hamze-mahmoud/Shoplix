const Order = require("../../models/Order");
const { cache } = require("../../config/cache");
const { getDateRange, growthPct } = require("../../utils/dateRange");
const { DEFAULT_COST_RATIO } = require("../../config/finance");

// Per-order COGS expression: Σ (item.cost OR price*ratio) × qty
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

// Per-order units sold (sum of the item.quantity array for one order)
const unitsExpr = { $sum: { $ifNull: ["$items.quantity", []] } };
// NOTE: used inside a $sum accumulator → { $sum: unitsExpr } in $group

function shape(b = {}) {
  const grossRevenue = b.grossRevenue || 0;
  const cogs = b.cogs || 0;
  const shipping = b.shipping || 0;
  const discount = b.discount || 0;
  const grossProfit = grossRevenue - cogs;
  const netProfit = grossProfit - shipping - discount;
  const orders = b.orders || 0;
  return {
    grossRevenue: round(grossRevenue),
    cogs: round(cogs),
    grossProfit: round(grossProfit),
    netProfit: round(netProfit),
    shipping: round(shipping),
    discount: round(discount),
    orders,
    units: b.units || 0,
    aov: orders ? round(grossRevenue / orders) : 0,
    grossMargin: grossRevenue ? round((grossProfit / grossRevenue) * 100) : 0,
    netMargin: grossRevenue ? round((netProfit / grossRevenue) * 100) : 0,
  };
}

const round = (n) => Math.round((n || 0) * 100) / 100;

const getFinancialSummary = async (req, res) => {
  try {
    const { period = "30d", from, to } = req.query;
    const { start, end, prevStart } = getDateRange(period, from, to);

    const cacheKey = `dashboard:fin:summary:${period}:${from || ""}:${to || ""}`;

    const data = await cache.getOrSet(cacheKey, 120, async () => {
      const rows = await Order.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: prevStart, $lte: end },
          },
        },
        {
          $group: {
            _id: { $cond: [{ $gte: ["$createdAt", start] }, "current", "previous"] },
            grossRevenue: { $sum: { $ifNull: ["$totalPrice", 0] } },
            cogs: { $sum: cogsExpr },
            shipping: { $sum: { $ifNull: ["$shippingCost", 0] } },
            discount: { $sum: { $ifNull: ["$discount", 0] } },
            orders: { $sum: 1 },
            units: { $sum: unitsExpr },
          },
        },
      ]);

      const current = shape(rows.find((r) => r._id === "current"));
      const previous = shape(rows.find((r) => r._id === "previous"));

      return {
        range: { start, end, period },
        current,
        previous,
        growth: {
          revenue: growthPct(current.grossRevenue, previous.grossRevenue),
          netProfit: growthPct(current.netProfit, previous.netProfit),
          orders: growthPct(current.orders, previous.orders),
          aov: growthPct(current.aov, previous.aov),
        },
      };
    });

    res.json(data);
  } catch (err) {
    console.error("getFinancialSummary error:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getFinancialSummary;
