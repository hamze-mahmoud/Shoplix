const mongoose = require("mongoose");
const Product = require("../../models/Product");
const Category = require("../../models/Category");
const { getPaginationParams, paginateAggregate } = require("../../utils/paginate");
const { cache } = require("../../config/cache");

// Safely cast a value to ObjectId (aggregation $match needs real ObjectIds,
// it does NOT auto-cast strings the way Mongoose find() does).
const toId = (v) => {
  try { return new mongoose.Types.ObjectId(v); } catch { return null; }
};

const SORT_STAGES = {
  price_low: { minPrice: 1 },
  price_high: { minPrice: -1 },
  name_asc: { name: 1 },
  name_desc: { name: -1 },
  oldest: { createdAt: 1 },
  newest: { createdAt: -1 },
};

module.exports = async function getAllProducts(req, res) {
  try {
    const { category, sort = "newest" } = req.query;
    const { page, limit } = getPaginationParams(req.query, { defaultLimit: 12 });

    // Cache key is derived from every query input that changes the result.
    const cacheKey = `products:list:${category || "all"}:${sort}:${page}:${limit}`;

    const payload = await cache.getOrSet(cacheKey, 60, async () => {
      // ---- CATEGORY FILTER (include direct children) ----
      const match = {};
      if (category && !["all", "undefined", "null"].includes(category)) {
        const childCategories = await Category.find({ parent: category }).select("_id").lean();
        const ids = [category, ...childCategories.map((c) => c._id)]
          .map(toId)
          .filter(Boolean);
        match.category = { $in: ids };
      }

      const sortStage = SORT_STAGES[sort] || SORT_STAGES.newest;

      // Single round-trip: data + total via $facet
      const { data, meta } = await paginateAggregate(
        Product,
        [
          { $match: match },
          {
            $addFields: {
              minPrice: { $min: "$variants.price" },
              totalStock: { $sum: "$variants.stock" },
            },
          },
          // ---- RATING AGGREGATE (from the reviews collection) ----
          {
            $lookup: {
              from: "reviews",
              localField: "_id",
              foreignField: "product",
              // only admin-approved reviews count toward the public rating
              pipeline: [
                { $match: { status: "approved" } },
                { $project: { rating: 1, _id: 0 } },
              ],
              as: "_reviews",
            },
          },
          {
            $addFields: {
              ratingCount: { $size: "$_reviews" },
              ratingAvg: {
                $cond: [
                  { $gt: [{ $size: "$_reviews" }, 0] },
                  { $round: [{ $avg: "$_reviews.rating" }, 1] },
                  0,
                ],
              },
            },
          },
          { $project: { _reviews: 0 } },
          // Hide products that are flagged hideWhenSoldOut AND fully sold out
          {
            $match: {
              $expr: {
                $not: {
                  $and: [{ $eq: ["$hideWhenSoldOut", true] }, { $eq: ["$totalStock", 0] }],
                },
              },
            },
          },
          { $sort: sortStage },
        ],
        { page, limit }
      );

      // Populate category on the paginated slice only
      await Product.populate(data, { path: "category" });

      return { products: data, meta };
    });

    return res.json({
      success: true,
      products: payload.products,
      // Backward-compatible legacy fields
      total: payload.meta.total,
      page: payload.meta.page,
      pages: payload.meta.totalPages,
      // Rich standardized metadata
      meta: payload.meta,
    });
  } catch (err) {
    console.error("GET_PRODUCTS_ERROR:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};
