const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  },

  productName: String,

  productImage: String,

  // localized snapshots (en/ar/he) for order history in the buyer's language
  translations: { type: Object },
  variantTranslations: { type: Object },

  variant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant"
  },

  color: String,

  storage: String,

  quantity: Number,

  price: Number,  // selling price at time of sale

  cost: Number    // cost price snapshot at time of sale (for accurate historical profit)
});

// A purchased bundle, snapshotted at sale time. `offerPrice` is the price for
// ONE bundle; `quantity` is how many were bought. `items` are the constituent
// product lines (for display + accurate cost/COGS), each already multiplied
// into the bundle — line.quantity = perBundleQty * bundleQuantity.
const orderBundleSchema = new mongoose.Schema({
  bundle: { type: mongoose.Schema.Types.ObjectId, ref: "BundleOffer" },
  title: String,
  image: String,
  offerPrice: Number, // per single bundle
  quantity: Number,   // number of bundles purchased
  items: [orderItemSchema],
}, { _id: false });

const orderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [orderItemSchema],

  // Bundle-offer purchases (kept separate from single-product items).
  bundles: [orderBundleSchema],

  totalPrice: {
    type: Number,
    required: true
  },

  status: {
    type: String,
    // New canonical lifecycle + legacy values (pending/paid/processing) kept
    // so existing orders remain valid. Legacy values are mapped on the frontend:
    // pending→placed, paid→confirmed, processing→preparing.
    enum: [
      'placed', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled',
      'pending', 'paid', 'processing'
    ],
    default: 'placed'
  },

  // Max 7-day delivery window from creation; set at order creation time.
  estimatedDelivery: {
    type: Date
  },

  shippingAddress: {
  region: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  }
},
shippingCost: Number,

discount: {
  type: Number,
  default: 0
},

paymentMethod: {
  type: String,
  default: "cash_on_delivery"
},

// The language the customer used when ordering — so confirmation messages
// (e.g. the WhatsApp message the admin sends) go out in their language.
language: {
  type: String,
  enum: ["en", "ar", "he"],
  default: "en"
}

}, { timestamps: true })

// Indexes for fast analytics / date-range filtering
orderSchema.index({ createdAt: -1 })
orderSchema.index({ status: 1, createdAt: -1 })

module.exports = mongoose.model('Order', orderSchema)