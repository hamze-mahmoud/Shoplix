const Review = require("../../models/Review");

// PATCH /api/admin/reviews/:id/status  { status: "approved" | "rejected" | "pending" }
module.exports = async function adminSetReviewStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const review = await Review.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate("user", "firstName lastName email")
      .populate("product", "name translations");

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    return res.json({ success: true, data: review });
  } catch (error) {
    console.error("adminSetReviewStatus error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
