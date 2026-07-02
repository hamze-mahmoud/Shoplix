const Review = require("../../models/Review");

module.exports = async function getProductReviews(req, res) {
  try {
    const { productId } = req.params;

    // Only admin-approved reviews are public; pending/rejected stay hidden.
    const reviews = await Review.find({ product: productId, status: "approved" })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    const count = reviews.length;
    const average = count
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / count
      : 0;

    // Distribution for the rating breakdown bars (5 -> 1 stars)
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: reviews.filter((r) => r.rating === star).length,
    }));

    return res.json({
      success: true,
      data: reviews,
      summary: {
        average: Math.round(average * 10) / 10,
        count,
        distribution,
      },
    });
  } catch (error) {
    console.error("getProductReviews error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
