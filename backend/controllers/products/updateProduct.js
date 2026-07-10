const Product = require("../../models/Product");
const Category = require("../../models/Category");
const { cache } = require("../../config/cache");
const { parseTranslations, deriveCanonical } = require("../../utils/i18nFields");

module.exports = async function updateProduct(req, res) {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      basePrice,
      category,
      variants,
      hideWhenSoldOut,
      isFeatured,
      discountPercent,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    // 🌳 CATEGORY CHECK (parent/child safe)
    if (category) {
      const categoryDoc = await Category.findById(category);

      if (!categoryDoc) {
        return res.status(404).json({
          error: "Category not found",
        });
      }

      product.category = category;
    }

    // 🌐 MULTILINGUAL FIELDS — re-derive canonical name/description
    const translations = parseTranslations(req.body.translations);
    if (translations) {
      product.translations = translations;
      const canonical = deriveCanonical(translations, {
        name: name || product.name,
        description: description || product.description,
      });
      product.name = canonical.name || product.name;
      product.description = canonical.description || product.description;
    } else {
      // 🧠 BASIC FIELDS (legacy single-language path)
      product.name = name || product.name;
      product.description = description || product.description;
    }

    product.basePrice = basePrice || product.basePrice;

    if (hideWhenSoldOut !== undefined) {
      product.hideWhenSoldOut = hideWhenSoldOut === true || hideWhenSoldOut === "true";
    }
    if (isFeatured !== undefined) {
      product.isFeatured = isFeatured === true || isFeatured === "true";
    }
    if (discountPercent !== undefined) {
      product.discountPercent = Math.min(Math.max(Number(discountPercent) || 0, 0), 90);
    }

    // "Who is this for?" tags — JSON string (multipart) or array
    if (req.body.audienceTags !== undefined) {
      const AUDIENCES = ["kids", "young", "women", "men", "elderly"];
      let tags = req.body.audienceTags;
      if (typeof tags === "string") {
        try { tags = JSON.parse(tags); } catch { tags = undefined; }
      }
      if (Array.isArray(tags)) {
        product.audienceTags = tags.filter((t) => AUDIENCES.includes(t));
      }
    }

    // 📦 PARSE VARIANTS — the client sends an array (form-serialized); tolerate
    // a JSON string too. (Previously this always JSON.parsed and crashed on the
    // array, which broke every product edit.)
    let updatedVariants = product.variants;
    if (variants) {
      updatedVariants = typeof variants === "string" ? JSON.parse(variants) : variants;
    }

    // 📸 CLOUDINARY FILES
    const files = req.files || [];

    /**
     * 🔥 IMPORTANT RULE:
     * We support replacing images per variant
     * Each variant can define "imageIndexes" OR we append new images
     */

    let fileIndex = 0;

    updatedVariants = updatedVariants.map((v, index) => {
      const existingVariant = product.variants?.[index];

      // keep old images if not provided
      let images = existingVariant?.images || [];

      // if new images exist → replace or append
      if (files.length > 0 && v.replaceImages) {
        const count = v.imageCount || files.length;

        const newImages = files
          .slice(fileIndex, fileIndex + count)
          .map((f) => f.path);

        fileIndex += count;

        images = newImages;
      }

      // Multilingual variant attributes → canonical color/storage
      const vtr = parseTranslations(v.translations, ["color", "storage"]);
      const vcanon = deriveCanonical(
        vtr,
        { color: v.color, storage: v.storage },
        ["color", "storage"]
      );

      return {
        ...v,
        color: vcanon.color,
        storage: vcanon.storage,
        translations: vtr || undefined,
        images,
      };
    });

    product.variants = updatedVariants;

    await product.save();

    await cache.delByPrefix("products:"); // invalidate product caches

    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err.message,
    });
  }
};