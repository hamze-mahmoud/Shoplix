// Delivery rates in ILS. Jerusalem and inside Palestine ('48) cost more;
// everywhere else is the flat rate. Mirrors backend createOrder so the quote
// the customer sees matches the order they're charged.
export const SHIPPING_FLAT = 20;
export const SHIPPING_REMOTE = 70;
export const REMOTE_REGIONS = ["jerusalem", "insidePalestine"];

export const getShippingCost = (region) =>
  REMOTE_REGIONS.includes(region) ? SHIPPING_REMOTE : SHIPPING_FLAT;
