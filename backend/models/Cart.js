const mongoose= require('mongoose')
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
      quantity: Number,
      price: Number // 💡 مهم جدًا (سعر وقت الإضافة)
    }
  ],
  // Bundle-offer lines, kept separate from single-product items. Each line is
  // one whole bundle bought `quantity` times at `price` (offerPrice snapshot).
  bundles: [
    {
      bundle: { type: mongoose.Schema.Types.ObjectId, ref: 'BundleOffer' },
      quantity: { type: Number, default: 1 },
      price: Number // offerPrice at time of adding
    }
  ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;