const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  storage: { type: String, required: false }, // 128GB, 256GB, etc
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  images: [
    {
      url: String,
      public_id: String
    }
  ],
  discount: { type: Number, default: 0 }, // percentage
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  }, { timestamps: true })

module.exports = mongoose.model('Variant', variantSchema)   
