import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Images, Plus, Pencil, Trash2, Loader2, Eye, EyeOff, X } from "lucide-react";

import { bannerService } from "../../../Shared/services/bannerService";
import { toastService } from "../../../Shared/services/toastService";
import LocalizedField from "../../components/forms/LocalizedField";

const LANGS = ["en", "ar", "he"];
const TEXT_FIELDS = ["kicker", "title", "title2", "subtitle", "cta"];

const emptyTranslations = () =>
  Object.fromEntries(
    LANGS.map((l) => [l, Object.fromEntries(TEXT_FIELDS.map((f) => [f, ""]))])
  );

const emptyForm = () => ({
  id: null,
  translations: emptyTranslations(),
  link: "/products",
  order: 0,
  active: true,
  imageFile: null,
  imageUrl: "",
  existingImage: "",
});

export default function BannersList() {
  const { t } = useTranslation();

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null); // null = form closed

  const load = async () => {
    setLoading(true);
    try {
      const res = await bannerService.adminGetBanners();
      setBanners(res.data.data || []);
    } catch {
      toastService.error(t("admin.banners.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => setForm(emptyForm());

  const openEdit = (b) => {
    const tr = emptyTranslations();
    for (const l of LANGS) {
      for (const f of TEXT_FIELDS) {
        tr[l][f] = b.translations?.[l]?.[f] || "";
      }
    }
    setForm({
      id: b._id,
      translations: tr,
      link: b.link || "/products",
      order: b.order ?? 0,
      active: b.active !== false,
      imageFile: null,
      imageUrl: "",
      existingImage: b.image,
    });
  };

  const setTrField = (field) => (lang, value) =>
    setForm((prev) => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: { ...prev.translations[lang], [field]: value },
      },
    }));

  const trVal = (field) =>
    Object.fromEntries(LANGS.map((l) => [l, form.translations[l][field]]));

  const handleSave = async (e) => {
    e.preventDefault();
    const hasTitle = LANGS.some((l) => form.translations[l].title.trim());
    if (!hasTitle) {
      toastService.warning(t("admin.banners.title_required"));
      return;
    }
    if (!form.id && !form.imageFile && !form.imageUrl.trim()) {
      toastService.warning(t("admin.banners.image_required"));
      return;
    }

    const data = new FormData();
    if (form.imageFile) data.append("image", form.imageFile);
    if (form.imageUrl.trim()) data.append("imageUrl", form.imageUrl.trim());
    data.append("translations", JSON.stringify(form.translations));
    data.append("link", form.link);
    data.append("order", String(form.order));
    data.append("active", String(form.active));

    setSaving(true);
    try {
      if (form.id) {
        await bannerService.updateBanner(form.id, data);
        toastService.success(t("admin.banners.updated"));
      } else {
        await bannerService.createBanner(data);
        toastService.success(t("admin.banners.created"));
      }
      setForm(null);
      await load();
    } catch (err) {
      toastService.error(err.response?.data?.message || t("admin.banners.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (b) => {
    const data = new FormData();
    data.append("active", String(!b.active));
    try {
      await bannerService.updateBanner(b._id, data);
      await load();
    } catch {
      toastService.error(t("admin.banners.save_failed"));
    }
  };

  const handleDelete = (b) => {
    toastService.confirm({
      message: t("admin.banners.delete_confirm"),
      variant: "error",
      onConfirm: async () => {
        try {
          await bannerService.deleteBanner(b._id);
          toastService.success(t("admin.banners.deleted"));
          await load();
        } catch {
          toastService.error(t("admin.banners.save_failed"));
        }
      },
    });
  };

  const previewSrc = form
    ? form.imageFile
      ? URL.createObjectURL(form.imageFile)
      : form.imageUrl.trim() || form.existingImage
    : "";

  const inputCls =
    "w-full text-black border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition";

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Images className="w-6 h-6 text-blue-600" />
            {t("admin.banners.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("admin.banners.subtitle")}</p>
        </div>

        {!form && (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-green-700 transition"
          >
            <Plus className="w-4 h-4" />
            {t("admin.banners.add")}
          </button>
        )}
      </div>

      {/* FORM */}
      {form && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {form.id ? t("admin.banners.edit_banner") : t("admin.banners.new_banner")}
            </h2>
            <button type="button" onClick={() => setForm(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* IMAGE */}
          <div className="space-y-3">
            <label className="block font-semibold text-gray-700">{t("admin.banners.image")}</label>
            {previewSrc && (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 max-w-xl">
                <img src={previewSrc} alt="" className="w-full h-44 object-cover" />
                {/* live caption preview (EN or first filled language) */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex items-center p-5">
                  <div className="text-white max-w-[70%]">
                    <p className="text-[10px] uppercase tracking-widest opacity-75">
                      {LANGS.map((l) => form.translations[l].kicker).find(Boolean)}
                    </p>
                    <p className="font-bold text-xl leading-tight">
                      {LANGS.map((l) => form.translations[l].title).find(Boolean)}{" "}
                      <span className="italic text-yellow-300">
                        {LANGS.map((l) => form.translations[l].title2).find(Boolean)}
                      </span>
                    </p>
                    <p className="text-xs opacity-80 mt-1 line-clamp-1">
                      {LANGS.map((l) => form.translations[l].subtitle).find(Boolean)}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] || null }))}
                className="text-sm text-gray-600 file:me-3 file:px-4 file:py-2 file:rounded-xl file:border-0 file:bg-[#111827] file:text-white file:text-sm file:font-semibold hover:file:bg-green-700 file:cursor-pointer"
              />
              <input
                type="url"
                placeholder={t("admin.banners.image_url_placeholder")}
                value={form.imageUrl}
                onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))}
                className={`${inputCls} sm:max-w-md`}
              />
            </div>
            <p className="text-xs text-gray-500">{t("admin.banners.image_hint")}</p>
          </div>

          {/* CAPTIONS */}
          <LocalizedField label={t("admin.banners.field_kicker")} value={trVal("kicker")} onChange={setTrField("kicker")} />
          <LocalizedField label={t("admin.banners.field_title")} value={trVal("title")} onChange={setTrField("title")} required />
          <LocalizedField label={t("admin.banners.field_title2")} value={trVal("title2")} onChange={setTrField("title2")} />
          <LocalizedField label={t("admin.banners.field_subtitle")} value={trVal("subtitle")} onChange={setTrField("subtitle")} multiline />
          <LocalizedField label={t("admin.banners.field_cta")} value={trVal("cta")} onChange={setTrField("cta")} />

          {/* SETTINGS */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">{t("admin.banners.field_link")}</label>
              <input type="text" value={form.link} onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))} className={inputCls} />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">{t("admin.banners.field_order")}</label>
              <input type="number" value={form.order} onChange={(e) => setForm((p) => ({ ...p, order: Number(e.target.value) || 0 }))} className={inputCls} />
            </div>
            <label className="flex items-center gap-3 mt-8 cursor-pointer">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
                className="w-4 h-4 accent-green-600"
              />
              <span className="text-sm font-medium text-gray-700">{t("admin.banners.field_active")}</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setForm(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
              {t("admin.common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("admin.common.save")}
            </button>
          </div>
        </form>
      )}

      {/* LIST */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 p-10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          {t("admin.common.loading")}
        </div>
      ) : banners.length === 0 && !form ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
          {t("admin.banners.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <img src={b.image} alt="" className="w-full sm:w-40 h-24 object-cover rounded-xl border border-gray-100 shrink-0" />

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {b.translations?.en?.title || b.title} {b.translations?.en?.title2}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${b.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {b.active ? t("admin.banners.active") : t("admin.banners.hidden")}
                  </span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-1 mt-0.5">
                  {b.translations?.en?.subtitle || b.subtitle}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {t("admin.banners.field_order")}: {b.order} · {b.link}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(b)} title={b.active ? t("admin.banners.hide") : t("admin.banners.show")} className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50">
                  {b.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(b)} className="p-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(b)} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
