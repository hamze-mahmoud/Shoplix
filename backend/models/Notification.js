const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    // Who receives this notification (null = broadcast to everyone)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },

    // Related order (for order notifications)
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },

    // High-level category — drives default icon/colour groups
    type: {
      type: String,
      enum: ['system', 'order', 'promotion', 'admin'],
      default: 'system',
    },

    // Specific event — drives the exact icon/colour + i18n key
    // e.g. placed | confirmed | preparing | shipped | out_for_delivery | delivered | cancelled
    event: {
      type: String,
      default: null,
    },

    // i18n keys + params: the FRONTEND renders these live in the user's language.
    // Text is never hard-coded here.
    titleKey: { type: String, default: null },
    messageKey: { type: String, default: null },
    params: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Plain-text fallback (English) for non-i18n consumers / safety.
    title: { type: String },
    message: { type: String },

    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
)

// Fast "my unread notifications, newest first" queries
notificationSchema.index({ user: 1, read: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
