const Cart = require("../../models/Cart");
const { resolveBundle } = require("../../utils/resolveBundle");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id,
    })
      .populate("items.product")
      .populate({ path: "bundles.bundle", populate: { path: "items.product" } });

    if (!cart) {
      return res.json({
        items: [],
        bundles: [],
        total: 0,
      });
    }

    const items = cart.items
      .map((item) => {
        const product = item.product;

        if (!product) return null;

        const variant = product.variants.id(item.variantId);

        if (!variant) return null;

        return {
          productId: product._id,
          variantId: variant._id,

          name: product.name,
          description: product.description,
          translations: product.translations,        // localized product name/description

          color: variant.color,
          storage: variant.storage,
          variantTranslations: variant.translations,  // localized color/storage
          stock: variant.stock,                        // available stock (quantity cap)

          image:
            variant.images?.length > 0
              ? variant.images[0]
              : null,

          price: item.price,
          quantity: item.quantity,

          subtotal:
            item.price * item.quantity,
        };
      })
      .filter(Boolean);

    // Resolve bundle lines (drop any whose offer/products no longer exist).
    const bundles = (cart.bundles || [])
      .map((line) => {
        const resolved = resolveBundle(line.bundle);
        if (!resolved) return null;
        const unit = line.price ?? resolved.offerPrice; // snapshot price wins
        return {
          bundleId: resolved._id,
          title: resolved.title,
          translations: resolved.translations, // localized bundle title
          image: resolved.images?.[0] || resolved.products?.[0]?.image || null,
          offerPrice: unit,
          quantity: line.quantity,
          subtotal: unit * line.quantity,
          products: resolved.products,
        };
      })
      .filter(Boolean);

    const itemsTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const bundlesTotal = bundles.reduce((sum, b) => sum + b.subtotal, 0);

    res.json({
      items,
      bundles,
      total: itemsTotal + bundlesTotal,
    });
  } catch (err) {
    console.error("getCart error:", err);

    res.status(500).json({
      error: "Failed to get cart",
    });
  }
};