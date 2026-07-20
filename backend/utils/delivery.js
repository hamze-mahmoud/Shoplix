// Delivery-fee calculation.
//
// Base fee is per REGION: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. The WHOLE ORDER then gets a SINGLE size multiplier from its combined
// LINEAR size  x = Σ (each item's LARGEST dimension × quantity), in cm. An
// item's largest dimension is the biggest of width/height/depth/diameter — so
// the metric works for any shape (box, cylinder, round item):
//   x < 100 cm  (under 1 m)   → ×1
//   x = 100 cm  (exactly 1 m) → ×1.5
//   x > 100 cm  (over 1 m)    → ×(x / 70)   — one base-fee unit per 70 cm
//   delivery = round(regionBase × multiplier)          (one fee for the order)
// Kept in one place so backend (order truth) and frontend (checkout preview)
// stay identical.

// Per-region base fee. Legacy West Bank city values fall through to ₪20.
const REGION_FEE = {
  westBank: 20,
  jerusalem: 30,
  insidePalestine: 70,
};
const DEFAULT_FEE = 20;

const ONE_METRE_CM = 100; // 1 m threshold, in cm
const SIZE_UNIT_CM = 70; // over 1 m, every 70 cm adds one base-fee unit

function baseDeliveryFee(region) {
  return REGION_FEE[region] ?? DEFAULT_FEE;
}

// The dimension fields an item can carry; largest one is its "size" for shipping.
const DIMENSION_KEYS = ["widthCm", "heightCm", "depthCm", "diameterCm"];

// An item's largest dimension (cm), across whatever dims its shape provided.
function longestSide(item) {
  return DIMENSION_KEYS.reduce((mx, k) => Math.max(mx, Number(item[k]) || 0), 0);
}

// items → the order's linear size x (cm): sum of each item's largest side × qty.
function orderLinearSize(items) {
  return items.reduce((sum, it) => sum + longestSide(it) * (it.quantity || 1), 0);
}

// order linear size x (cm) → size multiplier
function orderSizeMultiplier(x) {
  if (x < ONE_METRE_CM) return 1; // under 1 m
  if (x === ONE_METRE_CM) return 1.5; // exactly 1 m
  return x / SIZE_UNIT_CM; // over 1 m: proportional, one unit per 70 cm
}

// items: [{ widthCm, heightCm, depthCm, diameterCm, quantity }] → one delivery
// fee for the order (only the dims a shape uses need be present).
function computeDelivery(items, region) {
  const x = orderLinearSize(items);
  return Math.round(baseDeliveryFee(region) * orderSizeMultiplier(x));
}

module.exports = {
  REGION_FEE,
  ONE_METRE_CM,
  SIZE_UNIT_CM,
  DIMENSION_KEYS,
  baseDeliveryFee,
  longestSide,
  orderLinearSize,
  orderSizeMultiplier,
  computeDelivery,
};
