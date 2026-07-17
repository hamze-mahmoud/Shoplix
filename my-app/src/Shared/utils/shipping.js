// Delivery-fee calculation (mirrors backend utils/delivery.js so the quote the
// customer sees matches what they're charged).
//
// Base fee is per region: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. The WHOLE order then gets ONE size multiplier from its combined
// LINEAR size  x = Σ (each item's longest side × qty), in cm:
//   x < 100 cm → ×1 · x = 100 cm → ×1.5 · x > 100 cm → ×(x / 70)
// delivery = round(regionBase × multiplier).

export const REGION_FEE = { westBank: 20, jerusalem: 30, insidePalestine: 70 };
const DEFAULT_FEE = 20;
const ONE_METRE_CM = 100; // 1 m threshold, in cm
const SIZE_UNIT_CM = 70; // over 1 m, every 70 cm adds one base-fee unit

export const baseDeliveryFee = (region) => REGION_FEE[region] ?? DEFAULT_FEE;

// items → the order's linear size x (cm): sum of each item's longest side × qty.
export const orderLinearSize = (items = []) =>
  items.reduce((sum, it) => {
    const longest = Math.max(Number(it.widthCm) || 0, Number(it.heightCm) || 0);
    return sum + longest * (it.quantity || 1);
  }, 0);

// order linear size x (cm) → size multiplier
export const orderSizeMultiplier = (x) => {
  if (x < ONE_METRE_CM) return 1; // under 1 m
  if (x === ONE_METRE_CM) return 1.5; // exactly 1 m
  return x / SIZE_UNIT_CM; // over 1 m: proportional, one unit per 70 cm
};

// items: [{ widthCm, heightCm, quantity }] → single delivery fee for the order.
export const computeDelivery = (items = [], region) =>
  Math.round(baseDeliveryFee(region) * orderSizeMultiplier(orderLinearSize(items)));

// Back-compat: the region base fee alone.
export const getShippingCost = (region) => baseDeliveryFee(region);
