// Delivery-fee calculation.
//
// Base fee is per REGION: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. Each purchased item then multiplies that base by its variant SIZE:
//   under_1m (< 1m×1m) → ×1 · 1m (1m×1m) → ×1.5 · over_1m (>1m×1m) → ×2
// The order's delivery = Σ over items of  base × sizeMultiplier × quantity.
// Kept in one place so backend (order truth) and frontend (checkout preview)
// stay identical.

// Per-region base fee. Legacy West Bank city values (hebron/bethlehem/jericho)
// fall through to the ₪20 default.
const REGION_FEE = {
  westBank: 20,
  jerusalem: 30,
  insidePalestine: 70,
};
const DEFAULT_FEE = 20;

const SIZE_MULTIPLIER = {
  under_1m: 1,
  "1m": 1.5,
  over_1m: 2,
};

function baseDeliveryFee(region) {
  return REGION_FEE[region] ?? DEFAULT_FEE;
}

function sizeMultiplier(size) {
  return SIZE_MULTIPLIER[size] ?? 1; // unknown/legacy size → base fee
}

// items: [{ size, quantity }]  → total delivery fee for the order.
function computeDelivery(items, region) {
  const base = baseDeliveryFee(region);
  return items.reduce(
    (sum, it) => sum + base * sizeMultiplier(it.size) * (it.quantity || 1),
    0
  );
}

module.exports = { REGION_FEE, SIZE_MULTIPLIER, baseDeliveryFee, sizeMultiplier, computeDelivery };
