import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Tags, Plus, Pencil, Trash2, Loader2, X, ImagePlus, PackageX } from "lucide-react";

import { offerService } from "../../../Shared/services/offerService";
import { toastService } from "../../../Shared/services/toastService";
import { formatPrice } from "../../../Shared/utils/formPrice";
import OfferProductPicker from "./OfferProductPicker";
import LocalizedField from "../../components/forms/LocalizedField";

const LANGS = ["en", "ar", "he"];
const TEXT_FIELDS = ["title", "description"];

const emptyTranslations = () =>
  Object.fromEntries(
    LANGS.map((l) => [l, Object.fromEntries(TEXT_FIELDS.map((f) => [f, ""]))])
  );

// ISO date → value for <input type="datetime-local"> (local time, no seconds)
const toLocalInput = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 16);
};

const STATUS_OPTIONS = ["draft", "active", "inactive"];

const emptyForm = () => {
  const now = new Date();
  const inWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    id: null,
    translations: emptyTranslations(),
    offerPrice: "",
    startDate: toLocalInput(now),
    endDate: toLocalInput(inWeek),
    status: "active",
    items: [],
    existingImages: [],
    newFiles: [],
  };
};

const statusStyle = {
  active: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  inactive: "bg-gray-100 text-gray-500",
};

export default function OffersList() {
  const { t } = useTranslation();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await offerService.adminGetOffers();
      setOffers(res.data.data || []);
    } catch {
      toastService.error(t("admin.offers.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => setForm(emptyForm());

  const openEdit = (o) => {
    // Rebuild the { en/ar/he: { title, description } } grid, falling back to
    // the canonical title/description (English) for offers created before i18n.
    const tr = emptyTranslations();
    for (const l of LANGS) {
      tr[l].title = o.translations?.[l]?.title || (l === "en" ? o.title || "" : "");
      tr[l].description =
        o.translations?.[l]?.description || (l === "en" ? o.description || "" : "");
    }
    setForm({
      id: o._id,
      translations: tr,
      offerPrice: String(o.offerPrice ?? ""),
      startDate: toLocalInput(o.startDate),
      endDate: toLocalInput(o.endDate),
      status: o.status || "draft",
      // rebuild picker lines from the resolved products
      items: (o.products || []).map((p) => ({
        product: p.product,
        variantId: p.variantId,
        quantity: p.quantity,
        _name: p.name,
        _variantLabel: [p.color, p.storage].filter(Boolean).join(" · ") || "Default",
        _image: p.image,
        _price: p.unitPrice,
        _stock: p.stock,
      })),
      existingImages: o.images || [],
      newFiles: [],
    });
  };

  const patch = (updates) => setForm((p) => ({ ...p, ...updates }));

  // LocalizedField helpers: setTrField("title")(lang, value) / trVal("title")
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

  const addFiles = (fileList) =>
    patch({ newFiles: [...form.newFiles, ...Array.from(fileList || [])] });

  const removeExisting = (url) =>
    patch({ existingImages: form.existingImages.filter((u) => u !== url) });

  const removeNewFile = (idx) =>
    patch({ newFiles: form.newFiles.filter((_, i) => i !== idx) });

  const handleSave = async (e) => {
    e.preventDefault();

    const hasTitle = LANGS.some((l) => form.translations[l].title.trim());
    if (!hasTitle) return toastService.warning(t("admin.offers.title_required"));
    if (form.items.length === 0) return toastService.warning(t("admin.offers.products_required"));
    if (!(Number(form.offerPrice) >= 0)) return toastService.warning(t("admin.offers.price_required"));
    if (!form.startDate || !form.endDate) return toastService.warning(t("admin.offers.dates_required"));
    if (new Date(form.endDate) <= new Date(form.startDate)) return toastService.warning(t("admin.offers.date_order"));

    const data = new FormData();
    data.append("translations", JSON.stringify(form.translations));
    data.append("offerPrice", String(Number(form.offerPrice)));
    data.append("startDate", new Date(form.startDate).toISOString());
    data.append("endDate", new Date(form.endDate).toISOString());
    data.append("status", form.status);
    data.append(
      "items",
      JSON.stringify(form.items.map((l) => ({ product: l.product, variantId: l.variantId, quantity: l.quantity })))
    );
    data.append("existingImages", JSON.stringify(form.existingImages));
    form.newFiles.forEach((f) => data.append("images", f));

    setSaving(true);
    try {
      if (form.id) {
        await offerService.updateOffer(form.id, data);
        toastService.success(t("admin.offers.updated"));
      } else {
        await offerService.createOffer(data);
        toastService.success(t("admin.offers.created"));
      }
      setForm(null);
      await load();
    } catch (err) {
      toastService.error(err.response?.data?.message || t("admin.offers.save_failed"));
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (o, status) => {
    const data = new FormData();
    data.append("status", status);
    try {
      await offerService.updateOffer(o._id, data);
      await load();
    } catch {
      toastService.error(t("admin.offers.save_failed"));
    }
  };

  const handleDelete = (o) => {
    toastService.confirm({
      message: t("admin.offers.delete_confirm"),
      variant: "error",
      onConfirm: async () => {
        try {
          await offerService.deleteOffer(o._id);
          toastService.success(t("admin.offers.deleted"));
          await load();
        } catch {
          toastService.error(t("admin.offers.save_failed"));
        }
      },
    });
  };

  const inputCls =
    "w-full text-black border border-gray-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition";

  const newFilePreviews = form ? form.newFiles.map((f) => URL.createObjectURL(f)) : [];

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tags className="w-6 h-6 text-blue-600" />
            {t("admin.offers.title")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("admin.offers.subtitle")}</p>
        </div>
        {!form && (
          <button onClick={openCreate} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111827] text-white text-sm font-semibold hover:bg-green-700 transition">
            <Plus className="w-4 h-4" />
            {t("admin.offers.add")}
          </button>
        )}
      </div>

      {/* FORM */}
      {form && (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {form.id ? t("admin.offers.edit") : t("admin.offers.new")}
            </h2>
            <button type="button" onClick={() => setForm(null)} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* LOCALIZED TITLE + DESCRIPTION (EN / AR / HE) */}
          <LocalizedField
            label={t("admin.offers.field_title")}
            value={trVal("title")}
            onChange={setTrField("title")}
            required
          />
          <LocalizedField
            label={t("admin.offers.field_description")}
            value={trVal("description")}
            onChange={setTrField("description")}
            multiline
          />

          {/* PRICE */}
          <div className="sm:max-w-xs">
            <label className="block mb-2 font-semibold text-gray-700">{t("admin.offers.field_price")}</label>
            <input type="number" min={0} step="0.01" value={form.offerPrice} onChange={(e) => patch({ offerPrice: e.target.value })} className={inputCls} />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">{t("admin.offers.field_start")}</label>
              <input type="datetime-local" value={form.startDate} onChange={(e) => patch({ startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">{t("admin.offers.field_end")}</label>
              <input type="datetime-local" value={form.endDate} onChange={(e) => patch({ endDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-700">{t("admin.offers.field_status")}</label>
              <select value={form.status} onChange={(e) => patch({ status: e.target.value })} className={inputCls}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{t(`admin.offers.status_${s}`)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* IMAGES */}
          <div className="space-y-3">
            <label className="block font-semibold text-gray-700">{t("admin.offers.field_images")}</label>
            <div className="flex flex-wrap gap-3">
              {form.existingImages.map((url) => (
                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-200 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExisting(url)} className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {newFilePreviews.map((src, i) => (
                <div key={src} className="relative w-24 h-24 rounded-xl overflow-hidden border border-green-300 group">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 end-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-green-400 hover:text-green-500 cursor-pointer transition">
                <ImagePlus className="w-6 h-6" />
                <span className="text-[11px]">{t("admin.offers.add_image")}</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
              </label>
            </div>
          </div>

          {/* PRODUCTS PICKER */}
          <div className="space-y-3">
            <label className="block font-semibold text-gray-700">{t("admin.offers.field_products")}</label>
            <OfferProductPicker value={form.items} onChange={(items) => patch({ items })} />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setForm(null)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50">
              {t("admin.common.cancel")}
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("admin.common.save")}
            </button>
          </div>
        </form>
      )}

      {/* LIST */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 p-10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" /> {t("admin.common.loading")}
        </div>
      ) : offers.length === 0 && !form ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
          {t("admin.offers.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((o) => (
            <div key={o._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              {o.images?.[0] ? (
                <img src={o.images[0]} alt="" className="w-full sm:w-32 h-24 object-cover rounded-xl border border-gray-100 shrink-0" />
              ) : (
                <div className="w-full sm:w-32 h-24 rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 shrink-0">
                  <PackageX className="w-7 h-7" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900 truncate">{o.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusStyle[o.status] || statusStyle.inactive}`}>
                    {t(`admin.offers.status_${o.status}`)}
                  </span>
                  {!o.inStock && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-600">
                      {t("admin.offers.out_of_stock")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {(o.products?.length || 0)} {t("admin.offers.products_count")} ·{" "}
                  <span className="font-semibold text-green-600">{formatPrice(o.offerPrice)}</span>
                  {o.originalTotal > o.offerPrice && (
                    <span className="text-gray-400 line-through ms-2">{formatPrice(o.originalTotal)}</span>
                  )}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(o.startDate).toLocaleDateString()} → {new Date(o.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={o.status}
                  onChange={(e) => changeStatus(o, e.target.value)}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-600 outline-none focus:ring-2 focus:ring-green-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{t(`admin.offers.status_${s}`)}</option>
                  ))}
                </select>
                <button onClick={() => openEdit(o)} className="p-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(o)} className="p-2.5 rounded-xl border border-red-200 text-red-500 hover:bg-red-50">
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
