import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { localized } from "../../../../Shared/utils/localize";
import { formatPrice } from "../../../../Shared/utils/formPrice";
import { discountOf, salePrice } from "../../../../Shared/utils/pricing";

export default function ProductVariants({ product, setSelectedV }) {
  const { t, i18n } = useTranslation();
  const variants = product.variants || [];
  const [selected, setSelected] = useState(variants[0] || null);

  // Localized "Color / Storage" label for a variant
  const variantLabel = (v) =>
    [localized(v, "color", i18n.language), localized(v, "storage", i18n.language)]
      .filter(Boolean)
      .join(" / ");

  useEffect(() => {
    if (variants[0]) {
      setSelected(variants[0]);
      setSelectedV(variants[0]);
    }
  }, [product]);

  const handleSelect = (v) => {
    setSelected(v);
    setSelectedV(v);
  };

  if (!variants.length) return null;

  const isOutOfStock = (v) => (v.stock || 0) === 0;
  const isLowStock = (v) => (v.stock || 0) > 0 && (v.stock || 0) <= 5;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{t("products.variants")}</h3>
        {selected && (
          <span className="text-sm text-gray-500">
            {variantLabel(selected)}
          </span>
        )}
      </div>

      {/* Variant buttons */}
      <div className="flex flex-wrap gap-2">
        {variants.map((v, i) => {
          const oos = isOutOfStock(v);
          const low = isLowStock(v);
          const isActive = selected === v;

          return (
            <button
              key={i}
              onClick={() => !oos && handleSelect(v)}
              disabled={oos}
              className={`
                relative px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200
                ${oos ? "opacity-40 cursor-not-allowed border-gray-200 text-gray-400 line-through" : ""}
                ${isActive && !oos
                  ? "border-green-500 bg-green-50 text-green-700 shadow-sm"
                  : !oos
                  ? "border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                  : ""}
              `}
            >
              {variantLabel(v)}
              {isActive && !oos && (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 absolute -top-1.5 -end-1.5 bg-white rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected variant info */}
      {selected && (
        <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">{t("products.price")}:</span>
            {discountOf(product) > 0 ? (
              <>
                <span className="font-bold text-rose-600 text-base">
                  {formatPrice(salePrice(selected.price, discountOf(product)))}
                </span>
                <span className="text-xs text-gray-400 line-through">{formatPrice(selected.price)}</span>
              </>
            ) : (
              <span className="font-bold text-green-600 text-base">{formatPrice(selected.price)}</span>
            )}
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <div className="flex items-center gap-1.5">
            {isOutOfStock(selected) ? (
              <span className="text-red-500 font-medium">{t("products.out_of_stock")}</span>
            ) : isLowStock(selected) ? (
              <span className="text-orange-500 font-medium">
                {t("products.low_stock", { count: selected.stock })}
              </span>
            ) : (
              <span className="text-green-600 font-medium">{t("products.in_stock")}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
