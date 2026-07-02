const mongoose = require("mongoose");
const Review = require("../models/Review");

/**
 * Attach `ratingAvg` (1-decimal) and `ratingCount` to a list of plain product
 * objects, using a single grouped aggregation over the reviews collection.
 * Products with no reviews get ratingAvg: 0, ratingCount: 0.
 */
async function attachRatings(products) {
  if (!Array.isArray(products) || products.length === 0) return products;

  const ids = products
    .map((p) => {
      try {
        return new mongoose.Types.ObjectId(p._id);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  if (!ids.length) return products;

  const agg = await Review.aggregate([
    { $match: { product: { $in: ids } } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const byId = new Map(agg.map((r) => [String(r._id), r]));

  return products.map((p) => {
    const r = byId.get(String(p._id));
    return {
      ...p,
      ratingAvg: r ? Math.round(r.avg * 10) / 10 : 0,
      ratingCount: r ? r.count : 0,
    };
  });
}

module.exports = attachRatings;
