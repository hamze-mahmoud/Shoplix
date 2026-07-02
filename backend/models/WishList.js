const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true   // 👈 كل user عنده wishlist واحدة فقط
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },

      // اختياري لو بدك تدعم variants
      variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant'
      },

      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true })

module.exports = mongoose.model('Wishlist', wishlistSchema)