// Delivery-fee calculation (mirrors backend utils/delivery.js so the quote the
// customer sees matches what they're charged).
//
// Base fee is per region: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. The WHOLE order then gets ONE size multiplier from its combined
// area (Σ width×height×qty, cm²) vs one square metre:
//   < 1 m² → ×1 · 1–2 m² → ×1.5 · ≥ 2 m² → ×2
// delivery = regionBase × orderMultiplier.

export const REGION_FEE = { westBank: 20, jerusalem: 30, insidePalestine: 70 };
const DEFAULT_FEE = 20;
const ONE_SQ_METRE_CM2 = 100 * 100; // 10,000 cm²

export const baseDeliveryFee = (region) => REGION_FEE[region] ?? DEFAULT_FEE;

export const orderSizeMultiplier = (totalAreaCm2) => {
  const m2 = totalAreaCm2 / ONE_SQ_METRE_CM2;
  if (m2 < 1) return 1;
  if (m2 < 2) return 1.5;
  return 2;
};

// items: [{ widthCm, heightCm, quantity }] → single delivery fee for the order.
export const computeDelivery = (items = [], region) => {
  const totalArea = items.reduce(
    (sum, it) =>
      sum + (Number(it.widthCm) || 0) * (Number(it.heightCm) || 0) * (it.quantity || 1),
    0
  );
  return baseDeliveryFee(region) * orderSizeMultiplier(totalArea);
};

// Back-compat: the region base fee alone.
export const getShippingCost = (region) => baseDeliveryFee(region);
