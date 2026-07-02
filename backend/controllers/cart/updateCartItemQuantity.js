const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    let { quantity } = req.body;

    quantity = Number(quantity);

    // =========================
    // VALIDATE QUANTITY
    // =========================
    if (isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        error: "Quantity must be a number",
      });
    }

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        error: "Quantity cannot be negative",
      });
    }

    // =========================
    // FIND USER CART
    // =========================
    const cart = await Cart.findOne({
      user: req.user.id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        error: "Cart not found",
      });
    }

    // =========================
    // FIND ITEM IN CART
    // =========================
    const item = cart.items.find(
      (item) =>
        String(item.product) === String(productId) &&
        String(item.variantId) === String(variantId)
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        error: "Item not found in cart",
      });
    }

    // =========================
    // REMOVE ITEM IF 0
    // =========================
    if (quantity === 0) {
      cart.items = cart.items.filter(
        (i) =>
          !(
            String(i.product) === String(productId) &&
            String(i.variantId) === String(variantId)
          )
      );

      await cart.save();

      return res.json({
        success: true,
        message: "Item removed from cart",
      });
    }

    // =========================
    // FIND PRODUCT
    // =========================
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // =========================
    // FIND VARIANT
    // =========================
    const variant = product.variants.find(
      (v) => String(v._id) === String(variantId)
    );

    if (!variant) {
      return res.status(404).json({
        success: false,
        error: "Variant not found",
      });
    }

    // =========================
    // CHECK STOCK
    // =========================
    if (quantity > variant.stock) {
      return res.status(400).json({
        success: false,
        error: `Only ${variant.stock} items available in stock`,
        availableStock: variant.stock,
      });
    }

    // =========================
    // UPDATE QUANTITY
    // =========================
    item.quantity = quantity;

    await cart.save();

    return res.json({
      success: true,
      message: "Cart updated successfully",
      quantity: item.quantity,
    });

  } catch (err) {
    console.error("UPDATE_CART_ERROR:", err);

    return res.status(500).json({
      success: false,
      error: "Server error",
      message: err.message,
    });
  }
};