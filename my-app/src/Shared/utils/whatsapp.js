// Helpers for WhatsApp "click to chat" links (https://wa.me/<number>?text=...).
// No WhatsApp Business API needed — the admin clicks, WhatsApp opens with the
// message pre-filled, and they hit send.

// Normalize a phone to the digits-only international form WhatsApp wants.
// Palestine (+970) / Israel (+972) rules:
//   • A number that already carries a country code (leading +, 00, 970 or 972)
//     is respected as-is.
//   • A local 056… / 059… mobile is AMBIGUOUS — it can belong to +970 or +972,
//     so the caller (admin) must choose the code.
//   • Any other local number (leading 0) defaults to Israel (+972).
//
// Returns { number, ambiguous, localRest }:
//   • number    – final intl digits when determinable (or when preferredCc is
//                 supplied for an ambiguous one); "" when not resolvable yet.
//   • ambiguous – true for a 056/059 local number with no preferredCc.
//   • localRest – the local digits without the leading 0, so the UI can prepend
//                 either "970" or "972".
export function normalizePhone(phone, preferredCc = "") {
  const empty = { number: "", ambiguous: false, localRest: "" };
  if (!phone) return empty;

  const raw = String(phone).trim();
  let d = raw.replace(/\D/g, ""); // strip +, spaces, dashes, etc.
  if (!d) return empty;

  const hadPlus = raw.startsWith("+") || d.startsWith("00");
  if (d.startsWith("00")) d = d.slice(2);

  // Explicit country code already present → respect it.
  if (hadPlus || d.startsWith("970") || d.startsWith("972")) {
    return { number: d, ambiguous: false, localRest: "" };
  }

  if (d.startsWith("0")) {
    const rest = d.slice(1); // drop the leading 0
    const ambiguous = rest.startsWith("56") || rest.startsWith("59");
    if (ambiguous) {
      if (preferredCc) return { number: preferredCc + rest, ambiguous: false, localRest: rest };
      return { number: "", ambiguous: true, localRest: rest };
    }
    // every other local prefix → Israel (+972)
    return { number: "972" + rest, ambiguous: false, localRest: rest };
  }

  // No leading 0 and no country code — best effort, default to +972.
  return { number: "972" + d, ambiguous: false, localRest: d };
}

// Build the wa.me URL from an already-resolved intl number, or "" if missing.
export function waUrlForNumber(number, text) {
  if (!number) return "";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
