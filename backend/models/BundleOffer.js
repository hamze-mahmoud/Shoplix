const mongoose = require("mongoose");

// Per-language localized offer text. Canonical title/description below stay as
// the default (used for search/admin lists/fallback); `translations` holds the
// EN/AR/HE variants the storefront resolves from.
const offerLocalizedSchema = new mongoose.Schema(
  { title: String, description: String },
  { _id: false }
);
const offerTranslationsSchema = new mongoose.Schema(
  { en: offerLocalizedSchema, ar: offerLocalizedSchema, he: offerLocalizedSchema },
  { _id: false }
);

// One product line inside a bundle: a SPECIFIC pinned variant of a product,
// plus how many of it the bundle contains (admin-chosen quantity).
const bundleItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

// A bundle offer: several pinned product/variant lines sold together for one
// `offerPrice`, live only while `status === "active"` AND now is within
// [startDate, endDate]. Expired offers auto-hide because the public query
// filters on endDate — no cron needed.
const bundleOfferSchema = new mongoose.Schema(
  {
    // canonical (default) values — kept for search / admin lists / fallback
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },

    // { en/ar/he: { title, description } } — storefront resolves the visitor's
    // language from here, falling back to the canonical fields above.
    translations: offerTranslationsSchema,

    items: [bundleItemSchema],
    images: [String], // Cloudinary URLs (multiple offer images)

    offerPrice: { type: Number, required: true, min: 0 }, // total for the whole bundle

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["draft", "active", "inactive"],
      default: "draft",
    },
  },
  { timestamps: true }
);

// Fast public lookup of live offers.
bundleOfferSchema.index({ status: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model("BundleOffer", bundleOfferSchema);
