const LANGS = [
  { code: "en", label: "English", short: "EN", dir: "ltr" },
  { code: "ar", label: "العربية", short: "ع", dir: "rtl" },
  { code: "he", label: "עברית", short: "עב", dir: "rtl" },
];

/**
 * Multilingual text field — shows ALL three language inputs at once
 * (one box per language), instead of a tab switcher.
 *
 * value:   { en, ar, he } strings (for a single field, e.g. name)
 * onChange:(langCode, text) => void
 */
export default function LocalizedField({
  label,
  value = {},
  onChange,
  multiline = false,
  placeholder = "",
  required = false,
}) {
  const inputClasses =
    "w-full text-black border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition";

  return (
    <div>
      {label && (
        <label className="block mb-2 font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}

      <div className="space-y-3">
        {LANGS.map((l) => {
          const filled = !!(value[l.code] && value[l.code].trim());
          return (
            <div key={l.code}>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-flex items-center justify-center min-w-[1.6rem] h-5 px-1.5 text-[11px] font-bold rounded ${
                    filled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {l.short}
                </span>
                <span className="text-xs font-medium text-gray-500">{l.label}</span>
              </div>

              {multiline ? (
                <textarea
                  dir={l.dir}
                  rows={3}
                  value={value[l.code] || ""}
                  placeholder={placeholder}
                  onChange={(e) => onChange(l.code, e.target.value)}
                  className={inputClasses}
                />
              ) : (
                <input
                  type="text"
                  dir={l.dir}
                  value={value[l.code] || ""}
                  placeholder={placeholder}
                  onChange={(e) => onChange(l.code, e.target.value)}
                  className={inputClasses}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
