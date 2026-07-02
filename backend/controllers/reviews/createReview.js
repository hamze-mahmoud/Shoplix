const Order = require("../../models/Order");
const Review = require("../../models/Review");

module.exports = async function createReview(req, res) {
  try {
    const userId = req.user._id;
    const { product, rating, comment } = req.body;

    if (!product || !rating) {
      return res.status(400).json({ success: false, message: "Product and rating are required" });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be a whole number between 1 and 5" });
    }

    // Re-verify the purchase server-side — never trust the client.
    const purchaseOrder = await Order.findOne({
      user: userId,
      status: { $ne: "cancelled" },
      "items.product": product,
    }).sort({ createdAt: -1 });

    if (!purchaseOrder) {
      return res.status(403).json({
        success: false,
        message: "You can only review products you've purchased",
      });
    }

    const review = await Review.create({
      product,
      user: userId,
      order: purchaseOrder._id,
      rating: numericRating,
      comment: comment?.trim() || "",
    });

    await review.populate("user", "firstName lastName");

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "You've already reviewed this product" });
    }
    console.error("createReview error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
