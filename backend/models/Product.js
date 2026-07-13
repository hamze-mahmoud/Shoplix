const mongoose = require("mongoose");

// Per-language localized variant attributes (color/storage labels). The
// top-level color/storage stay canonical for cart/snapshots/back-compat.
const variantLocalizedSchema = new mongoose.Schema(
  { color: String, storage: String },
  { _id: false }
);
const variantTranslationsSchema = new mongoose.Schema(
  { en: variantLocalizedSchema, ar: variantLocalizedSchema, he: variantLocalizedSchema },
  { _id: false }
);

const variantSchema = new mongoose.Schema({
  color: String,
  storage: String,
  translations: variantTranslationsSchema,
  price: Number,      // selling price
  costPrice: Number,  // cost to acquire — used for profit/margin analytics
  stock: Number,
  images: [String],
  // Physical dimensions in centimetres (10–500). The whole order's combined
  // area (Σ width×height×qty) drives the delivery multiplier — see
  // utils/delivery.js. Legacy variants with no dimensions count as 0 area.
  widthCm: { type: Number, default: 0, min: 0, max: 500 },
  heightCm: { type: Number, default: 0, min: 0, max: 500 },
});

// Per-language localized text. `name`/`description` below stay as the canonical
// (default) values used for search, sorting and snapshots; `translations` holds
// the localized variants the storefront resolves from.
const localizedSchema = new mongoose.Schema(
  { name: String, description: String },
  { _id: false }
);
const translationsSchema = new mongoose.Schema(
  { en: localizedSchema, ar: localizedSchema, he: localizedSchema },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  translations: translationsSchema,
  basePrice: Number,

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  variants: [variantSchema], // 🔥 HERE

  // Storefront sale: a percentage off (0 = no sale). When > 0 the product shows
  // a SALE badge + struck-through price, and the discounted price is what the
  // customer actually pays (applied in addToCart + createOrder).
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 90,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
    isFeatured: {
    type: Boolean,
    default: false,
  },

  // When true, the product is hidden from the storefront once it is fully
  // sold out. When false (default), a sold-out product still shows with an
  // "Out of Stock" badge.
  hideWhenSoldOut: {
    type: Boolean,
    default: false,
  },

  // Who the product is intended for (multi-select in the admin form).
  // Empty array = suitable for everyone. Drives the "Tailored for you"
  // page + audience diversity in AI recommendations.
  audienceTags: {
    type: [String],
    enum: ["kids", "young", "women", "men", "elderly"],
    default: [],
  },
});

module.exports = mongoose.model("Product", productSchema);