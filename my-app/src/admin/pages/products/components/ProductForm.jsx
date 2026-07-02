import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import LocalizedField from "../../../components/forms/LocalizedField";
import Button from "../../../components/ui/Button";
import VariantBuilder from "./VariantBuilder";
import { categoryService } from "../../../../Shared/services/categoryService";
import CategoryPathSelector from "../../categories/components/CategoryPathSelector";

const emptyTranslations = () => ({
  en: { name: "", description: "" },
  ar: { name: "", description: "" },
  he: { name: "", description: "" },
});

export default function ProductForm({
  onSubmit,
  initialData,
  loading = false,
}) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  useEffect(() => {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
  
          const res = await categoryService.getAllCategories();
          console.log("res",res)
          // backend safe fallback
          const data = res.data;
  
          setCategories(Array.isArray(data) ? data : data?.categories || []);
        } catch (err) {
          console.error("Failed to load categories:", err);
        } finally {
          setLoadingCategories(false);
        }
      };
  
      fetchCategories();
    }, []);



  const [form, setForm] = useState({
    category: "",
    isFeatured: false,
    hideWhenSoldOut: false,
    discountPercent: 0,
  });

  const [translations, setTranslations] = useState(emptyTranslations());
  const [variants, setVariants] = useState([]);

  // 🔥 sync edit mode safely
  useEffect(() => {
    if (!initialData) return;

    setForm({
      category: initialData.category?._id || initialData.category || "",
      isFeatured: initialData.isFeatured || false,
      hideWhenSoldOut: initialData.hideWhenSoldOut || false,
      discountPercent: initialData.discountPercent || 0,
    });

    const tr = initialData.translations;
    setTranslations(
      tr
        ? {
            en: { name: tr.en?.name || "", description: tr.en?.description || "" },
            ar: { name: tr.ar?.name || "", description: tr.ar?.description || "" },
            he: { name: tr.he?.name || "", description: tr.he?.description || "" },
          }
        : {
            ...emptyTranslations(),
            en: { name: initialData.name || "", description: initialData.description || "" },
          }
    );

    setVariants(
      (initialData.variants || []).map((v) => ({
        ...v,
        translations: v.translations
          ? {
              en: { color: v.translations.en?.color || "", storage: v.translations.en?.storage || "" },
              ar: { color: v.translations.ar?.color || "", storage: v.translations.ar?.storage || "" },
              he: { color: v.translations.he?.color || "", storage: v.translations.he?.storage || "" },
            }
          : {
              en: { color: v.color || "", storage: v.storage || "" },
              ar: { color: "", storage: "" },
              he: { color: "", storage: "" },
            },
      }))
    );
  }, [initialData]);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // setField("name")(lang, value) → updates translations[lang].name
  const setField = (field) => (lang, value) =>
    setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  const fieldVal = (field) => ({
    en: translations.en[field],
    ar: translations.ar[field],
    he: translations.he[field],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // canonical (first non-empty across en → ar → he) for back-compat
    const pick = (f) => translations.en[f] || translations.ar[f] || translations.he[f] || "";

    const payload = {
      ...form,
      name: pick("name"),
      description: pick("description"),
      translations,
      variants,
    };
    onSubmit(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-white p-6 rounded-xl shadow-sm"
    >
      {/* 🔹 BASIC INFO SECTION */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t("admin.products.basic_info")}</h2>

        <LocalizedField
          label={t("admin.products.product_name")}
          value={fieldVal("name")}
          onChange={setField("name")}
          required
        />

        <LocalizedField
          label={t("admin.products.description")}
          value={fieldVal("description")}
          onChange={setField("description")}
          multiline
        />
      </div>

      {/* 🔹 CATEGORY SECTION */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("admin.nav.categories")}</h2>

    
           <CategoryPathSelector
  value={form.category}
  onChange={(id) =>
    handleChange("category", id)
  }
/>
      </div>

      {/* 🔥 VARIANTS SECTION */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          {t("admin.products.variants")}
        </h2>

        <VariantBuilder
          variants={variants}
          setVariants={setVariants}
        />
      </div>

      {/* 🔹 SALE / DISCOUNT SECTION */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">{t("admin.products.sale_section")}</h2>
        <label className="block text-sm font-medium text-gray-700">
          {t("admin.products.discount_label")}
        </label>
        <div className="flex items-center gap-2 max-w-[200px]">
          <input
            type="number"
            min={0}
            max={90}
            value={form.discountPercent}
            onChange={(e) =>
              handleChange(
                "discountPercent",
                Math.min(Math.max(Number(e.target.value) || 0, 0), 90)
              )
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none"
          />
          <span className="text-gray-500 font-medium">%</span>
        </div>
        {Number(form.discountPercent) > 0 && (
          <p className="text-xs font-semibold text-rose-600">
            {t("admin.products.discount_on", { percent: Number(form.discountPercent) })}
          </p>
        )}
        <p className="text-xs text-gray-500">{t("admin.products.discount_hint")}</p>
      </div>

      {/* 🔹 VISIBILITY SECTION */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">{t("admin.products.visibility")}</h2>

        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => handleChange("isFeatured", e.target.checked)}
            className="mt-1 w-4 h-4 accent-blue-600"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">{t("admin.products.featured_label")}</span>
            <span className="block text-xs text-gray-500">{t("admin.products.featured_hint")}</span>
          </span>
        </label>

        <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hideWhenSoldOut}
            onChange={(e) => handleChange("hideWhenSoldOut", e.target.checked)}
            className="mt-1 w-4 h-4 accent-blue-600"
          />
          <span>
            <span className="block text-sm font-medium text-gray-900">{t("admin.products.hide_soldout_label")}</span>
            <span className="block text-xs text-gray-500">
              {t("admin.products.hide_soldout_hint")}
            </span>
          </span>
        </label>
      </div>

      {/* 🔹 ACTIONS */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          className="text-black"
          onClick={() => {
            setForm({ category: "", isFeatured: false, hideWhenSoldOut: false, discountPercent: 0 });
            setTranslations(emptyTranslations());
            setVariants([]);
          }}
        >
          {t("admin.common.reset")}
        </Button>

        <Button type="submit" className="text-black" disabled={loading}>
          {loading ? t("admin.common.saving") : t("admin.products.save")}
        </Button>
      </div>
    </form>
  );
}