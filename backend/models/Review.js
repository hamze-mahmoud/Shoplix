const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },

  rating: { type: Number, min: 1, max: 5, required: true },

  comment: { type: String, trim: true, maxlength: 1000 },

  // Moderation: reviews are hidden from the storefront until an admin
  // approves them. Editing an approved review sends it back to pending.
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }

}, { timestamps: true })

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true })
// Admin moderation queue is filtered by status
reviewSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Review', reviewSchema)