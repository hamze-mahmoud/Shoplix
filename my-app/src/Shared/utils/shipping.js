// Delivery-fee calculation (mirrors backend utils/delivery.js so the quote the
// customer sees matches what they're charged).
//
// Base fee is region-based: ₪20 normally, ₪70 for the remote regions. Each item
// then multiplies that base by its variant SIZE tier:
//   under_1m (< 1m×1m) → ×1 · 1m (1m×1m) → ×1.5 · over_1m (>1m×1m) → ×2
// Order delivery = Σ over items of  base × sizeMultiplier × quantity.

export const SHIPPING_FLAT = 20;
export const SHIPPING_REMOTE = 70;
export const REMOTE_REGIONS = ["jerusalem", "insidePalestine"];

export const SIZE_MULTIPLIER = { under_1m: 1, "1m": 1.5, over_1m: 2 };

export const baseDeliveryFee = (region) =>
  REMOTE_REGIONS.includes(region) ? SHIPPING_REMOTE : SHIPPING_FLAT;

export const sizeMultiplier = (size) => SIZE_MULTIPLIER[size] ?? 1;

// Back-compat: the base region fee for a single unit at the smallest size.
export const getShippingCost = (region) => baseDeliveryFee(region);

// items: [{ size, quantity }] → total delivery fee for the whole cart.
export const computeDelivery = (items = [], region) => {
  const base = baseDeliveryFee(region);
  return items.reduce(
    (sum, it) => sum + base * sizeMultiplier(it.size) * (it.quantity || 1),
    0
  );
};
