/**
 * Central finance configuration & helpers.
 *
 * COST MODEL:
 * - Each variant has a real `costPrice`. When it's missing (legacy data or
 *   not yet entered), we estimate cost as `price * DEFAULT_COST_RATIO`.
 * - This keeps profit meaningful immediately while letting the store owner
 *   enter exact costs per product over time.
 */

// Assumed cost as a fraction of selling price when no costPrice is set.
// 0.6 → 60% cost, i.e. a 40% gross margin.
const DEFAULT_COST_RATIO = Number(process.env.DEFAULT_COST_RATIO) || 0.6;

// Optional sales tax rate (0 = none). Reserved for future use.
const TAX_RATE = Number(process.env.TAX_RATE) || 0;

/** Resolve a cost figure from a known costPrice or fall back to an estimate. */
function resolveCost(price = 0, costPrice) {
  if (typeof costPrice === "number" && costPrice >= 0) return costPrice;
  return Math.round(price * DEFAULT_COST_RATIO * 100) / 100;
}

module.exports = { DEFAULT_COST_RATIO, TAX_RATE, resolveCost };
