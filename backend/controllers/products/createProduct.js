const Product = require("../../models/Product");
const Category = require("../../models/Category");
const { cache } = require("../../config/cache");
const { parseTranslations, deriveCanonical } = require("../../utils/i18nFields");

module.exports = async function createProduct(req, res) {
  try {
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

    const cleanDiscount = Math.min(Math.max(Number(discountPercent) || 0, 0), 90);

    // "Who is this for?" tags — arrives as a JSON string (multipart) or array
    const AUDIENCES = ["kids", "young", "women", "men", "elderly"];
    let audienceTags = req.body.audienceTags;
    if (typeof audienceTags === "string") {
      try { audienceTags = JSON.parse(audienceTags); } catch { audienceTags = []; }
    }
    audienceTags = Array.isArray(audienceTags)
      ? audienceTags.filter((t) => AUDIENCES.includes(t))
      : [];

    // Multilingual fields → canonical name/description (search/sort/snapshots)
    const translations = parseTranslations(req.body.translations);
    const canonical = deriveCanonical(translations, { name, description });

    // parse variants
    let parsedVariants = variants || [];

    // Cloudinary files
    const files = req.files || [];

    // 🔥 DISTRIBUTE IMAGES INTO VARIANTS
    let fileIndex = 0;

    parsedVariants = parsedVariants.map((variant) => {
      const imagesCount = variant.imageCount || 1;

      const variantImages = files
        .slice(fileIndex, fileIndex + imagesCount)
        .map((f) => f.path);

      fileIndex += imagesCount;

      // Multilingual variant attributes → canonical color/storage
      const vtr = parseTranslations(variant.translations, ["color", "storage"]);
      const vcanon = deriveCanonical(
        vtr,
        { color: variant.color, storage: variant.storage },
        ["color", "storage"]
      );

      return {
        ...variant,
        color: vcanon.color,
        storage: vcanon.storage,
        translations: vtr || undefined,
        images: variantImages,
      };
    });

    // category validation
    const categoryDoc = await Category.findById(category);

    if (!categoryDoc) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Derive basePrice from the lowest variant sell price when not supplied
    const variantPrices = parsedVariants
      .map((v) => Number(v.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    const resolvedBasePrice =
      Number(basePrice) > 0
        ? Number(basePrice)
        : variantPrices.length
        ? Math.min(...variantPrices)
        : 0;

    const product = await Product.create({
      name: canonical.name,
      description: canonical.description,
      translations: translations || undefined,
      basePrice: resolvedBasePrice,
      category,
      variants: parsedVariants,
      hideWhenSoldOut: hideWhenSoldOut === true || hideWhenSoldOut === "true",
      isFeatured: isFeatured === true || isFeatured === "true",
      discountPercent: cleanDiscount,
      audienceTags,
    });

    await cache.delByPrefix("products:"); // invalidate product caches

    res.status(201).json(product);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};
