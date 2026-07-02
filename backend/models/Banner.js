const mongoose = require("mongoose");

// Homepage hero banner/slide — fully admin-editable (image + captions).
// Text lives in `translations` (en/ar/he) so the slider shows the visitor's
// language; canonical fields mirror the first non-empty language.
const bannerSchema = new mongoose.Schema(
  {
    image: { type: String, required: true }, // Cloudinary URL (or any image URL)

    // canonical (derived, for admin lists / fallback)
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },

    // { en/ar/he: { kicker, title, title2, subtitle, cta } }
    translations: { type: Object },

    link: { type: String, trim: true, default: "/products" }, // CTA target

    order: { type: Number, default: 0 }, // display order (ascending)
    active: { type: Boolean, default: true }, // inactive = hidden from the store
  },
  { timestamps: true }
);

bannerSchema.index({ active: 1, order: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
