const mongoose = require('mongoose')

// Per-language localized text. `name`/`description` stay canonical (search,
// uniqueness, fallback); `translations` holds the localized variants.
const localizedSchema = new mongoose.Schema(
  { name: String, description: String },
  { _id: false }
)
const translationsSchema = new mongoose.Schema(
  { en: localizedSchema, ar: localizedSchema, he: localizedSchema },
  { _id: false }
)

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
      parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null
    },
  description: String,
  translations: translationsSchema,
  icon: String, // emoji or icon URL
  image: {
    url: String,
    public_id: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Category', categorySchema)
