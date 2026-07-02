// App currency: Israeli new shekel (ILS), symbol ₪.
export const CURRENCY_SYMBOL = "₪";

// Format an amount as a price string, e.g. 2260 -> "₪2,260", 159.5 -> "₪159.5".
// Whole numbers show no decimals; otherwise up to 2 decimal places.
export function formatPrice(price) {
  const n = Number(price);
  const safe = Number.isFinite(n) ? n : 0;
  return `${CURRENCY_SYMBOL}${safe.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}
