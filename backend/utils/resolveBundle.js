const { salePrice } = require("./pricing");

// Turn a BundleOffer whose `items.product` is POPULATED into a display-ready
// object: each line resolved to its pinned variant (name/image/price/stock),
// plus computed originalTotal (what the items would cost normally, honoring
// per-product sales), savings, savings %, and whether every line is in stock.
//
// Returns null if the offer has no resolvable lines (all products/variants
// gone), so callers can skip a broken offer.
function resolveBundle(offer) {
  if (!offer) return null;

  const lines = [];
  let originalTotal = 0;
  let inStock = true;

  for (const item of offer.items || []) {
    const product = item.product;
    if (!product || !product.variants) continue; // product deleted

    const variant = product.variants.id
      ? product.variants.id(item.variantId)
      : (product.variants || []).find((v) => String(v._id) === String(item.variantId));
    if (!variant) continue; // variant removed

    const qty = item.quantity || 1;
    const unit = salePrice(variant.price, product.discountPercent);
    originalTotal += unit * qty;
    if ((variant.stock || 0) < qty) inStock = false;

    lines.push({
      product: product._id,
      variantId: variant._id,
      name: product.name,
      translations: product.translations,
      color: variant.color,
      storage: variant.storage,
      variantTranslations: variant.translations,
      image: variant.images?.[0] || null,
      unitPrice: unit,
      quantity: qty,
      stock: variant.stock || 0,
    });
  }

  if (lines.length === 0) return null;

  const offerPrice = offer.offerPrice || 0;
  const savings = Math.max(0, originalTotal - offerPrice);
  const savingsPercent =
    originalTotal > 0 ? Math.round((savings / originalTotal) * 100) : 0;

  return {
    _id: offer._id,
    title: offer.title,
    description: offer.description,
    // localized text (en/ar/he) — storefront resolves via localized()
    translations: offer.translations,
    images: offer.images || [],
    offerPrice,
    originalTotal: Math.round(originalTotal * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    savingsPercent,
    inStock,
    startDate: offer.startDate,
    endDate: offer.endDate,
    status: offer.status,
    products: lines,
  };
}

module.exports = { resolveBundle };
