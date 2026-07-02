const Cart = require("../../models/Cart");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      user: req.user.id,
    }).populate("items.product");

    if (!cart) {
      return res.json({
        items: [],
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

    const total = items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    res.json({
      items,
      total,
    });
  } catch (err) {
    console.error("getCart error:", err);

    res.status(500).json({
      error: "Failed to get cart",
    });
  }
};