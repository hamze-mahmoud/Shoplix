// Delivery-fee calculation.
//
// Base fee is region-dependent (as before): ₪20 normally, ₪70 for the remote
// regions. Each purchased item then multiplies that base by its variant SIZE:
//   under_1m (< 1m×1m) → ×1    (₪20)
//   1m       (1m×1m)   → ×1.5  (₪30)
//   over_1m  (> 1m×1m) → ×2    (₪40)
// The order's delivery = Σ over items of  base × sizeMultiplier × quantity.
// Kept in one place so backend (order truth) and frontend (checkout preview)
// stay identical.

const REMOTE_REGIONS = ["jerusalem", "insidePalestine"];

const SIZE_MULTIPLIER = {
  under_1m: 1,
  "1m": 1.5,
  over_1m: 2,
};

function baseDeliveryFee(region) {
  return REMOTE_REGIONS.includes(region) ? 70 : 20;
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

module.exports = { REMOTE_REGIONS, SIZE_MULTIPLIER, baseDeliveryFee, sizeMultiplier, computeDelivery };
