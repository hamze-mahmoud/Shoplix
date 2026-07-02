const Review = require("../../models/Review");

module.exports = async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ success: false, message: "Review not found" });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this review" });
    }

    if (rating !== undefined) {
      const numericRating = Number(rating);
      if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be a whole number between 1 and 5" });
      }
      review.rating = numericRating;
    }

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    // Any edit goes back through moderation — an approved review could
    // otherwise be rewritten into something we'd want to screen.
    review.status = "pending";

    await review.save();
    await review.populate("user", "firstName lastName");

    return res.json({ success: true, data: review });
  } catch (error) {
    console.error("updateReview error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
