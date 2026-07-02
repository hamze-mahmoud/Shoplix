const ORDER = ["en", "ar", "he"];

const baseLang = (lang) => (lang || "en").split("-")[0];

/**
 * Resolve a localized field (name / description) for a product or category.
 *   1. translations[currentLang][field] if present
 *   2. the canonical obj[field]
 *   3. translations in en → ar → he order
 */
export function localized(obj, field, lang) {
  if (!obj) return "";
  const lng = baseLang(lang);
  const tr = obj.translations;

  if (tr && tr[lng] && tr[lng][field] && String(tr[lng][field]).trim()) {
    return tr[lng][field];
  }
  if (obj[field] && String(obj[field]).trim()) return obj[field];
  if (tr) {
    for (const l of ORDER) {
      if (tr[l] && tr[l][field] && String(tr[l][field]).trim()) return tr[l][field];
    }
  }
  return "";
}
