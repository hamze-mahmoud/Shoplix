const LANGS = ["en", "ar", "he"];

/**
 * Normalize an incoming `translations` payload (object or JSON string) into a
 * clean { en/ar/he: { ...fields } } shape, dropping empty languages.
 * Returns null when nothing usable is provided.
 *
 * @param {*} raw      translations object or JSON string
 * @param {string[]} fields  which fields to keep (default: name/description)
 */
function parseTranslations(raw, fields = ["name", "description"]) {
  let tr = raw;
  if (typeof tr === "string") {
    try {
      tr = JSON.parse(tr);
    } catch {
      return null;
    }
  }
  if (!tr || typeof tr !== "object") return null;

  const out = {};
  for (const lang of LANGS) {
    const entry = {};
    let hasValue = false;
    for (const field of fields) {
      const v = (tr[lang]?.[field] ?? "").toString().trim();
      entry[field] = v;
      if (v) hasValue = true;
    }
    if (hasValue) out[lang] = entry;
  }
  return Object.keys(out).length ? out : null;
}

/**
 * Derive the canonical (default) values used for search, sorting, snapshots
 * and backward compatibility. Prefers translations (en → ar → he), then falls
 * back to the provided base values.
 *
 * @returns {object} an object with one key per field
 */
function deriveCanonical(translations, fallback = {}, fields = ["name", "description"]) {
  const pick = (field) => {
    if (translations) {
      for (const lang of LANGS) {
        const v = translations[lang]?.[field];
        if (v && String(v).trim()) return String(v).trim();
      }
    }
    const fb = fallback[field];
    return fb ? String(fb).trim() : "";
  };
  const result = {};
  for (const field of fields) result[field] = pick(field);
  return result;
}

module.exports = { LANGS, parseTranslations, deriveCanonical };
