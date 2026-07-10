// Phone helpers for phone-number sign-in.
//
// Users type numbers in many shapes ("059-123-4567", "+970 59 123 4567",
// "972591234567"). We store the digits as typed (for display / WhatsApp) and
// match accounts on a canonical KEY: the last 9 digits — the local significant
// number for Palestinian (+970) and Israeli (+972) mobiles — so the same
// person logging in with or without a country code still finds their account.

function digitsOf(phone) {
  return String(phone || "").replace(/\D/g, "");
}

// Canonical lookup key. Returns "" when the number is too short to be valid.
function phoneKeyOf(phone) {
  const d = digitsOf(phone);
  if (d.length < 9) return "";
  return d.slice(-9);
}

function isValidPhone(phone) {
  const d = digitsOf(phone);
  return d.length >= 9 && d.length <= 15;
}

// International number for the WhatsApp API ("970591234567" — no "+").
// Numbers typed with a country code pass through; local 05X numbers get one
// by carrier prefix: Jawwal (059) / Ooredoo (056) are Palestinian (+970),
// the other 05X carriers Israeli (+972).
function toWhatsAppNumber(phone) {
  const n = digitsOf(phone).replace(/^0+/, "");
  if (!n) return "";
  if (n.startsWith("970") || n.startsWith("972")) return n;
  if (/^5[96]/.test(n)) return "970" + n;
  if (/^5/.test(n)) return "972" + n;
  return (process.env.WHATSAPP_DEFAULT_CC || "970") + n;
}

module.exports = { digitsOf, phoneKeyOf, isValidPhone, toWhatsAppNumber };
