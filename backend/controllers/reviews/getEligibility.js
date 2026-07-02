const Order = require("../../models/Order");
const Review = require("../../models/Review");

// Can the logged-in user review this product? They must have at least one
// non-cancelled order containing the product (i.e. they actually bought it).
module.exports = async function getEligibility(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const purchaseOrder = await Order.findOne({
      user: userId,
      status: { $ne: "cancelled" },
      "items.product": productId,
    }).sort({ createdAt: -1 });

    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    return res.json({
      success: true,
      canReview: !!purchaseOrder && !existingReview,
      hasPurchased: !!purchaseOrder,
      hasReviewed: !!existingReview,
      existingReview,
    });
  } catch (error) {
    console.error("getEligibility error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
