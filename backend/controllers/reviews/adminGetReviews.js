const Review = require("../../models/Review");

// GET /api/admin/reviews?status=pending|approved|rejected|all
// Moderation queue — newest first, with reviewer + product context.
module.exports = async function adminGetReviews(req, res) {
  try {
    const { status = "pending" } = req.query;

    const filter = {};
    if (status !== "all") {
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }
      filter.status = status;
    }

    const [reviews, pendingCount] = await Promise.all([
      Review.find(filter)
        .populate("user", "firstName lastName email")
        .populate("product", "name translations")
        .sort({ createdAt: -1 })
        .limit(200),
      Review.countDocuments({ status: "pending" }),
    ]);

    return res.json({ success: true, data: reviews, pendingCount });
  } catch (error) {
    console.error("adminGetReviews error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
