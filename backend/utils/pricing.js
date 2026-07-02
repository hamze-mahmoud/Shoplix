// Effective selling price after a product-level percentage discount.
// salePrice(200, 25) -> 150. No/invalid discount returns the original price.
function salePrice(price, discountPercent) {
  const base = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  if (d <= 0) return base;
  const clamped = Math.min(Math.max(d, 0), 90);
  return Math.round(base * (1 - clamped / 100));
}

module.exports = { salePrice };
