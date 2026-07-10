import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Minus, Trash2, Loader2, PackageSearch } from "lucide-react";
import { offerService } from "../../../Shared/services/offerService";
import { useDebounce } from "../../../Shared/hooks/useDebounce";
import { formatPrice } from "../../../Shared/utils/formPrice";
import { localized } from "../../../Shared/utils/localize";

const variantLabel = (v) =>
  [v.color, v.storage].filter(Boolean).join(" · ") || "Default";

// Server-side product/variant picker for a bundle. `value` is the array of
// selected lines ({ product, variantId, quantity, _name, _variantLabel,
// _image, _price, _stock }); `onChange` returns the next array. Search is
// debounced and paginated on the server (aggregation) — the browser never
// loads the whole catalog.
export default function OfferProductPicker({ value = [], onChange }) {
  const { t, i18n } = useTranslation();

  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 400);
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debounced]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    offerService
      .searchProducts(debounced, page, 8)
      .then((res) => {
        if (ignore) return;
        setResults(res.data.products || []);
        setMeta(res.data.meta || null);
      })
      .catch(() => !ignore && setResults([]))
      .finally(() => !ignore && setLoading(false));
    return () => {
      ignore = true;
    };
  }, [debounced, page]);

  const isSelected = (variantId) =>
    value.some((l) => String(l.variantId) === String(variantId));

  const addLine = (product, v) => {
    if (isSelected(v._id)) return;
    onChange([
      ...value,
      {
        product: product._id,
        variantId: v._id,
        quantity: 1,
        _name: localized(product, "name", i18n.language) || product.name,
        _variantLabel: variantLabel(v),
        _image: v.image || null,
        _price: v.price,
        _stock: v.stock,
      },
    ]);
  };

  const setQty = (variantId, qty) =>
    onChange(
      value.map((l) =>
        String(l.variantId) === String(variantId)
          ? { ...l, quantity: Math.max(1, qty) }
          : l
      )
    );

  const removeLine = (variantId) =>
    onChange(value.filter((l) => String(l.variantId) !== String(variantId)));

  const inputCls =
    "w-full text-black border border-gray-200 rounded-2xl ps-10 pe-4 py-3 outline-none focus:ring-2 focus:ring-green-500 transition";

  return (
    <div className="space-y-4">
      {/* SELECTED LINES */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((l) => (
            <div
              key={l.variantId}
              className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl p-2.5"
            >
              {l._image ? (
                <img src={l._image} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{l._name}</p>
                <p className="text-xs text-gray-500">
                  {l._variantLabel} · {formatPrice(l._price)}
                  {typeof l._stock === "number" && (
                    <span className={l._stock > 0 ? "text-gray-400" : "text-red-500"}>
                      {" "}· {l._stock} {t("admin.offers.in_stock")}
                    </span>
                  )}
                </p>
              </div>
              {/* qty stepper */}
              <div className="flex items-center gap-1.5 bg-white rounded-xl border border-gray-200 p-1">
                <button type="button" onClick={() => setQty(l.variantId, l.quantity - 1)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center" disabled={l.quantity <= 1}>
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="number"
                  min={1}
                  value={l.quantity}
                  onChange={(e) => setQty(l.variantId, Number(e.target.value) || 1)}
                  className="w-10 text-center text-sm font-bold outline-none"
                />
                <button type="button" onClick={() => setQty(l.variantId, l.quantity + 1)} className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button type="button" onClick={() => removeLine(l.variantId)} className="p-2 rounded-xl text-red-500 hover:bg-red-50 shrink-0">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SEARCH */}
      <div className="relative">
        <Search className="absolute start-3 top-3.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("admin.offers.search_products")}
          className={inputCls}
        />
      </div>

      {/* RESULTS */}
      <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 max-h-80 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-gray-500 p-6 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> {t("admin.common.loading")}
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 text-gray-400 p-8 text-sm">
            <PackageSearch className="w-6 h-6" />
            {t("admin.offers.no_products")}
          </div>
        ) : (
          results.map((p) => (
            <div key={p._id} className="p-3">
              <p className="font-semibold text-gray-800 text-sm mb-2">{localized(p, "name", i18n.language) || p.name}</p>
              <div className="flex flex-wrap gap-2">
                {(p.variants || []).map((v) => {
                  const selected = isSelected(v._id);
                  return (
                    <button
                      type="button"
                      key={v._id}
                      onClick={() => addLine(p, v)}
                      disabled={selected}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                        selected
                          ? "bg-green-50 border-green-300 text-green-700 cursor-default"
                          : "bg-white border-gray-200 text-gray-700 hover:border-green-400 hover:bg-green-50"
                      }`}
                    >
                      {!selected && <Plus className="w-3 h-3" />}
                      {variantLabel(v)} · {formatPrice(v.price)}
                      <span className={v.stock > 0 ? "text-gray-400" : "text-red-400"}>({v.stock})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* PAGINATION */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm">
          <button type="button" disabled={!meta.hasPrevPage} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            {t("admin.common.prev")}
          </button>
          <span className="text-gray-500">{meta.page} / {meta.totalPages}</span>
          <button type="button" disabled={!meta.hasNextPage} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50">
            {t("admin.common.next")}
          </button>
        </div>
      )}
    </div>
  );
}
