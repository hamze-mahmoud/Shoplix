const Category = require("../../models/Category");
const { cache } = require("../../config/cache");
const { parseTranslations, deriveCanonical } = require("../../utils/i18nFields");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, parent, description, icon } = req.body;

    // Multilingual fields → canonical name/description
    const translations = parseTranslations(req.body.translations);
    const canonical = deriveCanonical(translations, { name, description });

    if (!canonical.name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({ name: canonical.name });

    if (exists) {
      return res.status(400).json({
        message: "Category already exists",
      });
    }

    const image = req.file
      ? { url: req.file.path, public_id: req.file.filename }
      : undefined;

    const category = await Category.create({
      name: canonical.name,
      parent: parent || null,
      description: canonical.description || null,
      translations: translations || undefined,
      icon: icon || null,
      image,
    });

    // Category structure affects category trees AND product list filtering
    await cache.delByPrefix("categories:");
    await cache.delByPrefix("products:");

    res.status(201).json(category);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports = createCategory;