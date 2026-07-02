import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImagePlus, X } from "lucide-react";
import CategorySelectTree from "./CategorySelectTree";
import LocalizedField from "../../../components/forms/LocalizedField";
import { categoryService } from "../../../../Shared/services/categoryService";

const emptyTranslations = () => ({
  en: { name: "", description: "" },
  ar: { name: "", description: "" },
  he: { name: "", description: "" },
});

export default function CategoryForm({
  initialData = null,
  onSubmit,
  loading = false,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    icon: "",
    parent: "",
  });
  const [translations, setTranslations] = useState(emptyTranslations());

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // =========================
  // LOAD CATEGORIES
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);

        const res = await categoryService.getCategoryTree();
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

  // =========================
  // EDIT MODE
  // =========================
  useEffect(() => {
    if (!initialData) return;

    setForm({
      icon: initialData.icon || "",
      parent: initialData.parent?._id || initialData.parent || "",
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

    setImagePreview(initialData.image?.url || null);
  }, [initialData]);

  // =========================
  // IMAGE FILE
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // setField("name")(lang, value) → updates translations[lang].name
  const setField = (field) => (lang, value) =>
    setTranslations((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
  const fieldVal = (field) => ({
    en: translations.en[field],
    ar: translations.ar[field],
    he: translations.he[field],
  });

  // =========================
  // SUBMIT FORM
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // canonical (first non-empty across en → ar → he)
    const pick = (f) => translations.en[f] || translations.ar[f] || translations.he[f] || "";
    const name = pick("name");
    const description = pick("description");

    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("description", description);
        fd.append("icon", form.icon);
        fd.append("parent", form.parent || "");
        fd.append("translations", JSON.stringify(translations));
        fd.append("image", imageFile);
        await onSubmit(fd);
      } else {
        await onSubmit({
          name,
          description,
          icon: form.icon,
          parent: form.parent || null,
          translations,
        });
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  // =========================
  // CREATE CATEGORY INLINE (SAFE)
  // =========================
  const handleCreateCategory = async (data) => {
    try {
      const {name}=data
      const res = await categoryService.createCategory({
        name,
        parent: null,
      });
console.log("res",res)
      const newCategory = res.data;

      setCategories((prev) => [...prev, newCategory]);

      return newCategory;
    } catch (err) {
      console.error("Create category error:", err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm space-y-6"
    >
      {/* NAME (multilingual) */}
      <LocalizedField
        label={t("admin.categories.name_label")}
        value={fieldVal("name")}
        onChange={setField("name")}
        placeholder={t("admin.categories.name_placeholder")}
        required
      />

      {/* DESCRIPTION (multilingual) */}
      <LocalizedField
        label={t("admin.products.description")}
        value={fieldVal("description")}
        onChange={setField("description")}
        placeholder={t("admin.categories.description_placeholder")}
        multiline
      />

      {/* IMAGE */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          {t("admin.categories.image_label")}
        </label>

        {imagePreview ? (
          <div className="relative w-40 h-40 rounded-2xl overflow-hidden border border-gray-200 group">
            <img src={imagePreview} alt="Category preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 end-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-40 h-40 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-500 cursor-pointer transition">
            <ImagePlus className="w-6 h-6 mb-1.5" />
            <span className="text-xs font-medium">{t("admin.categories.upload_image")}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="hidden" />
          </label>
        )}
      </div>

      {/* ICON */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          {t("admin.categories.icon_label")}
        </label>

        <input
          type="text"
          name="icon"
          value={form.icon}
          onChange={handleChange}
          placeholder="📱"
          className="w-full text-black border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      {/* PARENT CATEGORY */}
      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          {t("admin.categories.parent_label")}
        </label>

        <CategorySelectTree
          categories={categories}
          value={form.parent}
          onChange={(value) =>
            setForm((prev) => ({
              ...prev,
              parent: value,
            }))
          }
          onCreateCategory={handleCreateCategory}
        />
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold transition disabled:opacity-50"
      >
        {loading ? t("admin.common.saving") : t("admin.categories.save")}
      </button>
    </form>
  );
}