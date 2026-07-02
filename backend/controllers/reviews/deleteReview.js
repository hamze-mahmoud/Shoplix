const Review = require("../../models/Review");

module.exports = async function deleteReview(req, res) {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    const isOwner = review.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });
    }

    await review.deleteOne();

    return res.json({ success: true, message: "Review deleted" });
  } catch (error) {
    console.error("deleteReview error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
