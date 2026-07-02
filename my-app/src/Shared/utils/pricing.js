// Product-level sale helpers (mirrors backend utils/pricing.js).

export const discountOf = (product) => {
  const d = Number(product?.discountPercent) || 0;
  return d > 0 ? Math.min(d, 90) : 0;
};

export const isOnSale = (product) => discountOf(product) > 0;

// Discounted price for a given amount. salePrice(200, 25) -> 150.
export const salePrice = (price, discountPercent) => {
  const base = Number(price) || 0;
  const d = Number(discountPercent) || 0;
  if (d <= 0) return base;
  return Math.round(base * (1 - Math.min(d, 90) / 100));
};
