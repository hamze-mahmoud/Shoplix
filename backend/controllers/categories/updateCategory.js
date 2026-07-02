const Category = require("../../models/Category");
const { cache } = require("../../config/cache");
const cloudinary = require("../../config/cloudinary");
const { parseTranslations, deriveCanonical } = require("../../utils/i18nFields");

// UPDATE
const updateCategory = async (req, res) => {
  try {
    const { name, parent, description, icon } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 🌐 MULTILINGUAL FIELDS — re-derive canonical name/description
    const translations = parseTranslations(req.body.translations);
    if (translations) {
      category.translations = translations;
      const canonical = deriveCanonical(translations, {
        name: name || category.name,
        description: description || category.description,
      });
      category.name = canonical.name || category.name;
      category.description = canonical.description || category.description;
    } else {
      category.name = name || category.name;
      category.description = description || category.description;
    }

    category.parent = parent !== undefined ? parent : category.parent;
    category.icon = icon || category.icon;

    // 🔥 NEW IMAGE UPLOADED — replace on Cloudinary
    if (req.file) {
      if (category.image?.public_id) {
        await cloudinary.uploader.destroy(category.image.public_id);
      }
      category.image = { url: req.file.path, public_id: req.file.filename };
    }

    await category.save();

    await cache.delByPrefix("categories:");
    await cache.delByPrefix("products:");

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = updateCategory;