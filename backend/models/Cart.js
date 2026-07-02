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
  ]
}, { timestamps: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;