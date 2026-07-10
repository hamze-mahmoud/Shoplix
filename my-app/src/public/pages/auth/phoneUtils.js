// Local mobile number typed by the user, normalized: digits only, leading 0
// and an already-typed 970/972 country code stripped ("0599 123 456",
// "+970599123456" and "599123456" all become "599123456").
export function normalizeLocalPhone(raw) {
  let d = String(raw || "").replace(/\D/g, "").replace(/^0+/, "");
  if (d.startsWith("970") || d.startsWith("972")) {
    d = d.slice(3).replace(/^0+/, "");
  }
  return d;
}

// Valid PS/IL mobile: 9 digits starting with 5.
export const isValidMobile = (local) => /^5\d{8}$/.test(local);
