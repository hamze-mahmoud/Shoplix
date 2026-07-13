import { useTranslation } from "react-i18next";
import TextField from "../../../components/forms/TextField";
import LocalizedField from "../../../components/forms/LocalizedField";
import MultiImageUpload from "../../../components/forms/MultiImageUpload";

const emptyVariantTr = () => ({
  en: { color: "", storage: "" },
  ar: { color: "", storage: "" },
  he: { color: "", storage: "" },
});

export default function VariantBuilder({ variants, setVariants }) {
  const { t } = useTranslation();

  const handleChange = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  // Update a localized variant attribute (color/storage) + recompute canonical
  const handleLocalizedChange = (index, field, lang, value) => {
    const updated = [...variants];
    const v = { ...updated[index] };
    const tr = {
      en: { ...v.translations?.en },
      ar: { ...v.translations?.ar },
      he: { ...v.translations?.he },
    };
    tr[lang] = { ...tr[lang], [field]: value };
    v.translations = tr;
    // canonical = first non-empty en → ar → he
    v[field] = tr.en[field] || tr.ar[field] || tr.he[field] || "";
    updated[index] = v;
    setVariants(updated);
  };

  const fieldVal = (variant, field) => ({
    en: variant.translations?.en?.[field] || "",
    ar: variant.translations?.ar?.[field] || "",
    he: variant.translations?.he?.[field] || "",
  });

  const handleImagesChange = (index, images) => {
    const updated = [...variants];
    updated[index].images = images;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        color: "",
        storage: "",
        translations: emptyVariantTr(),
        price: "",
        costPrice: "",
        stock: "",
        size: "under_1m",
        images: [],
      },
    ]);
  };

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {variants.map((variant, i) => (
        <div key={i} className="border p-4 rounded-xl space-y-4 bg-gray-50">

          {/* Multilingual attributes */}
          <LocalizedField
            label={t("admin.products.color")}
            value={fieldVal(variant, "color")}
            onChange={(lang, val) => handleLocalizedChange(i, "color", lang, val)}
          />

          <LocalizedField
            label={t("admin.products.storage")}
            value={fieldVal(variant, "storage")}
            onChange={(lang, val) => handleLocalizedChange(i, "storage", lang, val)}
          />

          {/* Numeric attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TextField
              label={t("admin.products.sell_price")}
              type="number"
              value={variant.price}
              onChange={(e) => handleChange(i, "price", Number(e.target.value))}
            />
            <TextField
              label={t("admin.products.cost_price")}
              type="number"
              value={variant.costPrice ?? ""}
              onChange={(e) => handleChange(i, "costPrice", Number(e.target.value))}
            />
            <TextField
              label={t("admin.products.col_stock")}
              type="number"
              value={variant.stock}
              onChange={(e) => handleChange(i, "stock", Number(e.target.value))}
            />
          </div>

          {/* Size → delivery fee. under_1m ×1 · 1m ×1.5 · over_1m ×2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("admin.products.size_label", "Size (affects delivery fee)")}
            </label>
            <select
              value={variant.size || "under_1m"}
              onChange={(e) => handleChange(i, "size", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
            >
              <option value="under_1m">{t("admin.products.size_under_1m", "Under 1m×1m — standard delivery (×1)")}</option>
              <option value="1m">{t("admin.products.size_1m", "1m×1m — delivery ×1.5")}</option>
              <option value="over_1m">{t("admin.products.size_over_1m", "Larger than 1m×1m — delivery ×2")}</option>
            </select>
          </div>

          {/* Live margin / profit-per-unit hint */}
          {Number(variant.price) > 0 && Number(variant.costPrice) >= 0 && variant.costPrice !== "" && (
            <div className="flex items-center gap-4 text-xs bg-green-50 text-green-700 rounded-lg px-3 py-2">
              <span>
                {t("admin.products.profit_per_unit")}:{" "}
                <b>${(Number(variant.price) - Number(variant.costPrice)).toFixed(2)}</b>
              </span>
              <span className="text-green-600/70">
                {t("admin.products.margin")}:{" "}
                <b>
                  {Number(variant.price) > 0
                    ? Math.round(((Number(variant.price) - Number(variant.costPrice)) / Number(variant.price)) * 100)
                    : 0}
                  %
                </b>
              </span>
            </div>
          )}

          {/* Images */}
          <MultiImageUpload
            images={variant.images}
            onChange={(imgs) => handleImagesChange(i, imgs)}
          />

          <button
            type="button"
            onClick={() => removeVariant(i)}
            className="text-sm font-medium text-red-600 hover:text-red-700"
          >
            {t("admin.products.delete_variant")}
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addVariant}
        className="text-sm font-semibold text-green-700 hover:text-green-800"
      >
        + {t("admin.products.add_variant")}
      </button>
    </div>
  );
}
