// Delivery-fee calculation.
//
// Base fee is per REGION: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. The WHOLE ORDER then gets a SINGLE size multiplier based on its
// combined area (Σ width×height×quantity, in cm²) versus one square metre:
//   combined < 1 m²        → ×1
//   combined 1 m² to < 2 m² → ×1.5
//   combined ≥ 2 m²        → ×2
//   delivery = regionBase × orderMultiplier   (one fee for the order)
// Kept in one place so backend (order truth) and frontend (checkout preview)
// stay identical.

// Per-region base fee. Legacy West Bank city values fall through to ₪20.
const REGION_FEE = {
  westBank: 20,
  jerusalem: 30,
  insidePalestine: 70,
};
const DEFAULT_FEE = 20;

const ONE_SQ_METRE_CM2 = 100 * 100; // 10,000 cm²

function baseDeliveryFee(region) {
  return REGION_FEE[region] ?? DEFAULT_FEE;
}

// combined order area (cm²) → size multiplier
function orderSizeMultiplier(totalAreaCm2) {
  const m2 = totalAreaCm2 / ONE_SQ_METRE_CM2;
  if (m2 < 1) return 1;
  if (m2 < 2) return 1.5;
  return 2;
}

// items: [{ widthCm, heightCm, quantity }] → single delivery fee for the order.
function computeDelivery(items, region) {
  const totalArea = items.reduce(
    (sum, it) =>
      sum + (Number(it.widthCm) || 0) * (Number(it.heightCm) || 0) * (it.quantity || 1),
    0
  );
  return baseDeliveryFee(region) * orderSizeMultiplier(totalArea);
}

module.exports = { REGION_FEE, ONE_SQ_METRE_CM2, baseDeliveryFee, orderSizeMultiplier, computeDelivery };
