// Delivery-fee calculation.
//
// Base fee is per REGION: West Bank ₪20, Jerusalem ₪30, Palestinian Territories
// 1948 ₪70. The WHOLE ORDER then gets a SINGLE size multiplier from its combined
// LINEAR size  x = Σ (each item's LARGEST dimension × quantity), in cm. An
// item's largest dimension is the biggest of width/height/depth/diameter — so
// the metric works for any shape (box, cylinder, round item). The multiplier
// steps up per metre:
//   under 1 m               → ×1
//   exactly N metres        → ×(N + 0.5)   (1 m ×1.5, 2 m ×2.5, 3 m ×3.5 …)
//   between N and N+1 metres → ×(N + 1)     (1–2 m ×2, 2–3 m ×3, 3–4 m ×4 …)
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

const ONE_METRE_CM = 100; // 1 m, in cm

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

// order linear size x (cm) → size multiplier (per-metre steps; see header).
function orderSizeMultiplier(x) {
  const cm = Math.round(x); // whole-cm tiers → robust exact-metre check
  if (cm < ONE_METRE_CM) return 1; // under 1 m
  const metres = Math.floor(cm / ONE_METRE_CM);
  const onExactMetre = cm % ONE_METRE_CM === 0;
  return onExactMetre ? metres + 0.5 : metres + 1;
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
  DIMENSION_KEYS,
  baseDeliveryFee,
  longestSide,
  orderLinearSize,
  orderSizeMultiplier,
  computeDelivery,
};
