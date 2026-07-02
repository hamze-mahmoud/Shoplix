const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const notifyOrder = require("../../utils/notifyOrder");
const { resolveCost } = require("../../config/finance");
const { salePrice } = require("../../utils/pricing");
const { cache } = require("../../config/cache");

// Orders arrive within a maximum of 7 days from creation.
const DELIVERY_WINDOW_DAYS = 7;

module.exports = async function createOrder(req, res) {
  try {
    const { shippingAddress, paymentMethod, language } = req.body;

    // Remember the customer's language so confirmations go out in it.
    const SUPPORTED_LANGS = ["en", "ar", "he"];
    const orderLanguage = SUPPORTED_LANGS.includes(language) ? language : "en";

    // Honour the selected payment method (default to cash on delivery)
    const ALLOWED_PAYMENTS = ["cash_on_delivery", "credit_card", "paypal"];
    const selectedPayment = ALLOWED_PAYMENTS.includes(paymentMethod)
      ? paymentMethod
      : "cash_on_delivery";

    // Validate shipping info
    if (
      !shippingAddress ||
      !shippingAddress.region ||
      !shippingAddress.city ||
      !shippingAddress.description ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({
        success: false,
        error: "Complete shipping information is required",
      });
    }

    // Validate phone
    const phone = shippingAddress.phone.trim();

    if (!/^[0-9+\-\s]{8,20}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        error: "Invalid phone number",
      });
    }

    // Get cart
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");
    console.log("cart",cart)

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Drop orphaned items (product or its variant no longer exists, e.g. a
    // discontinued product) so one stale cart entry can't block the order.
    const validCartItems = cart.items.filter(
      (ci) => ci.product && ci.product.variants.id(ci.variantId)
    );

    if (validCartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty",
      });
    }

    // Persist the cleaned cart if any orphans were removed
    if (validCartItems.length !== cart.items.length) {
      cart.items = validCartItems;
      try { await cart.save(); } catch (e) { console.error("cart cleanup failed:", e.message); }
    }

    let subtotal = 0;

    const items = [];

    // Validate stock + build localized snapshots
    for (const cartItem of validCartItems) {
      const product = cartItem.product;
      const variant = product.variants.id(cartItem.variantId);

      if (variant.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}`,
        });
      }

      // Charge the discounted price when the product is on sale. Cost stays
      // based on the real price so profit/margin analytics reflect the sale.
      const unitPrice = salePrice(variant.price, product.discountPercent);
      subtotal += unitPrice * cartItem.quantity;

      items.push({
        product: product._id,
        productName: product.name,
        productImage:
          variant.images?.length > 0
            ? variant.images[0]
            : product.images?.[0] || null,
        // localized snapshots so order history shows the buyer's language
        translations: product.translations,
        variantTranslations: variant.translations,
        color: variant.color,
        storage: variant.storage,
        quantity: cartItem.quantity,
        price: unitPrice,
        // Snapshot cost at time of sale for accurate historical profit
        cost: resolveCost(variant.price, variant.costPrice),
      });
    }

    // Shipping calculation (ILS). Flat 20 everywhere except Jerusalem and
    // inside Palestine ('48), which cost 70.
    const REMOTE_REGIONS = ["jerusalem", "insidePalestine"];
    const shippingCost = REMOTE_REGIONS.includes(shippingAddress.region)
      ? 70
      : 20;

    const totalPrice =
      subtotal + shippingCost;

    // Estimated delivery = now + 7 days
    const estimatedDelivery = new Date(
      Date.now() + DELIVERY_WINDOW_DAYS * 24 * 60 * 60 * 1000
    );

    // Create order
    const order = await Order.create({
      user: req.user.id,

      items,

      shippingAddress: {
        region: shippingAddress.region,
        city: shippingAddress.city,
        description:
          shippingAddress.description,
        phone,
      },

      shippingCost,

      totalPrice,

      paymentMethod: selectedPayment,

      language: orderLanguage,

      status: "placed",

      estimatedDelivery,
    });

    // Fire "order placed" notification (real-time + stored)
    try {
      await notifyOrder(req.app.get("io"), order, "placed");
    } catch (notifyErr) {
      console.error("notifyOrder (placed) failed:", notifyErr);
    }

    // Live order feed for admins (dashboard realtime)
    try {
      const io = req.app.get("io");
      if (io) {
        io.to("admins").emit("order_created", {
          _id: order._id,
          totalPrice: order.totalPrice,
          itemCount: order.items.length,
          status: order.status,
          createdAt: order.createdAt,
        });
      }
    } catch (e) {
      console.error("order_created emit failed:", e);
    }

    // Bust the dashboard cache so analytics reflect the new order
    try { await cache.delByPrefix("dashboard:"); } catch {}

    // Update stock (only valid items)
    const saveOperations = [];

    for (const cartItem of validCartItems) {
  const product = cartItem.product;

  const variant = product.variants.id(
    cartItem.variantId
  );

  variant.stock -= cartItem.quantity;

  await product.save();
}

    await Promise.all(saveOperations);

    // Empty the cart now that the order has been placed.
    cart.items = [];
    try {
      await cart.save();
    } catch (e) {
      console.error("cart clear after order failed:", e.message);
    }

    return res.status(201).json({
      success: true,

      message:
        "Order created successfully",

      order: {
        _id: order._id,

        totalPrice:
          order.totalPrice,

        shippingCost:
          order.shippingCost,

        status: order.status,

        estimatedDelivery:
          order.estimatedDelivery,

        createdAt:
          order.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Create order error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Failed to create order",
    });
  }
};