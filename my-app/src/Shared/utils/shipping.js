// Delivery-fee calculation (mirrors backend utils/delivery.js so the quote the
// customer sees matches what they're charged).
//
// Base fee is per region: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. The WHOLE order then gets ONE size multiplier from its combined
// LINEAR size  x = Σ (each item's LARGEST dimension × qty), in cm — the biggest
// of width/height/depth/diameter, so it works for any shape. Steps per metre:
//   under 1 m → ×1 · exactly N m → ×(N+0.5) · between N and N+1 m → ×(N+1)
//   (1 m ×1.5 · 1–2 m ×2 · 2 m ×2.5 · 2–3 m ×3 · 3 m ×3.5 …)
// delivery = round(regionBase × multiplier).

export const REGION_FEE = { westBank: 20, jerusalem: 30, insidePalestine: 70 };
const DEFAULT_FEE = 20;
const ONE_METRE_CM = 100; // 1 m, in cm

export const baseDeliveryFee = (region) => REGION_FEE[region] ?? DEFAULT_FEE;

// The dimension fields an item can carry; the largest is its "size" for shipping.
const DIMENSION_KEYS = ["widthCm", "heightCm", "depthCm", "diameterCm"];

// An item's largest dimension (cm), across whatever dims its shape provided.
export const longestSide = (item = {}) =>
  DIMENSION_KEYS.reduce((mx, k) => Math.max(mx, Number(item[k]) || 0), 0);

// items → the order's linear size x (cm): sum of each item's largest side × qty.
export const orderLinearSize = (items = []) =>
  items.reduce((sum, it) => sum + longestSide(it) * (it.quantity || 1), 0);

// order linear size x (cm) → size multiplier (per-metre steps; see header).
export const orderSizeMultiplier = (x) => {
  const cm = Math.round(x); // whole-cm tiers → robust exact-metre check
  if (cm < ONE_METRE_CM) return 1; // under 1 m
  const metres = Math.floor(cm / ONE_METRE_CM);
  return cm % ONE_METRE_CM === 0 ? metres + 0.5 : metres + 1;
};

// items: [{ widthCm, heightCm, quantity }] → single delivery fee for the order.
export const computeDelivery = (items = [], region) =>
  Math.round(baseDeliveryFee(region) * orderSizeMultiplier(orderLinearSize(items)));

// Back-compat: the region base fee alone.
export const getShippingCost = (region) => baseDeliveryFee(region);
