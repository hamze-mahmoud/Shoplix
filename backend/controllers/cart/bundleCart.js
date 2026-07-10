const Cart = require("../../models/Cart");
const BundleOffer = require("../../models/BundleOffer");

// Live-offer guard (mirrors the public offers controller).
const isLive = (offer) => {
  if (!offer || offer.status !== "active") return false;
  const now = new Date();
  return offer.startDate <= now && offer.endDate >= now;
};

// Every pinned line must have enough stock for `bundleQty` bundles.
function bundleStockOk(offer, bundleQty) {
  for (const item of offer.items || []) {
    const product = item.product;
    const variant = product?.variants?.id(item.variantId);
    if (!variant) return false; // product/variant gone
    if ((variant.stock || 0) < (item.quantity || 1) * bundleQty) return false;
  }
  return true;
}

// POST /api/cart/bundle  { bundleId, quantity }
exports.addBundleToCart = async (req, res) => {
  try {
    const { bundleId, quantity = 1 } = req.body;
    const qty = Math.max(1, Number(quantity) || 1);

    if (!bundleId) return res.status(400).json({ error: "bundleId required" });

    const offer = await BundleOffer.findById(bundleId).populate({ path: "items.product" });
    if (!isLive(offer)) {
      return res.status(404).json({ error: "This offer is no longer available" });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [], bundles: [] });
    if (!cart.bundles) cart.bundles = [];

    const existing = cart.bundles.find((b) => String(b.bundle) === String(bundleId));
    const desiredQty = (existing?.quantity || 0) + qty;

    if (!bundleStockOk(offer, desiredQty)) {
      return res.status(400).json({ error: "Not enough stock for this bundle" });
    }

    if (existing) {
      existing.quantity = desiredQty;
      existing.price = offer.offerPrice; // refresh snapshot
    } else {
      cart.bundles.push({ bundle: offer._id, quantity: qty, price: offer.offerPrice });
    }

    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error("addBundleToCart error:", err);
    res.status(500).json({ error: "Failed to add bundle to cart" });
  }
};

// DELETE /api/cart/bundle/:bundleId
exports.removeBundleFromCart = async (req, res) => {
  try {
    const { bundleId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.bundles = (cart.bundles || []).filter(
      (b) => String(b.bundle) !== String(bundleId)
    );
    await cart.save();
    res.json({ success: true });
  } catch (err) {
    console.error("removeBundleFromCart error:", err);
    res.status(500).json({ error: err.message });
  }
};
