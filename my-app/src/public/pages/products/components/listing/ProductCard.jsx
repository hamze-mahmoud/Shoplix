import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, PackageX } from "lucide-react";
import { localized } from "../../../../../Shared/utils/localize";
import { onImgError } from "../../../../../Shared/utils/imageFallback";
import { formatPrice } from "../../../../../Shared/utils/formPrice";
import { discountOf, salePrice } from "../../../../../Shared/utils/pricing";
import SaleBadge from "../../../../../Shared/components/SaleBadge";

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const variants = product.variants || [];
  const discount = discountOf(product);
  const fmtRange = (mn, mx) => (mn === mx ? formatPrice(mn) : `${formatPrice(mn)} – ${formatPrice(mx)}`);

  const priceRange = useMemo(() => {
    if (!variants.length) return null;
    const prices = variants.map((v) => v.price || 0).filter(Boolean);
    if (!prices.length) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [variants]);

  const stock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  const image = variants?.[0]?.images?.[0];
  const isLowStock = stock > 0 && stock <= 5;
  const isOutOfStock = stock === 0;

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-[#111827]/15 hover:-translate-y-1 transition-all duration-300 flex flex-col">

      {/* IMAGE */}
      <div className="relative h-48 sm:h-52 bg-[#F8F9FA] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={localized(product, "name", lang)}
            loading="lazy"
            onError={onImgError}
            className={`w-full h-full object-contain group-hover:scale-105 transition duration-500 ${isOutOfStock ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
        )}

        {/* dark gradient for badge legibility */}
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/15 to-transparent pointer-events-none" />

        {/* BADGES */}
        <div className="absolute top-3 start-3 flex flex-col gap-1.5">
          {discount > 0 && <SaleBadge percent={discount} />}
          {isOutOfStock && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#111827] text-white">
              <PackageX className="w-3 h-3" />
              {t("products.out_of_stock")}
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-400 text-[#111827]">
              {t("products.low_stock", { count: stock })}
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
          {localized(product.category, "name", lang) || t("products.uncategorized")}
        </p>

        <h2 className="font-bold text-[#111827] line-clamp-1 text-sm sm:text-base group-hover:text-green-600 transition-colors">
          {localized(product, "name", lang)}
        </h2>

        <p className="text-xs text-gray-500 line-clamp-2 flex-1">
          {localized(product, "description", lang)}
        </p>

        {/* VARIANTS */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {variants.slice(0, 3).map((v, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 bg-[#111827]/5 text-[#111827]/70 rounded-full font-medium"
              >
                {localized(v, "color", lang)}
              </span>
            ))}
            {variants.length > 3 && (
              <span className="text-[10px] px-2 py-0.5 bg-[#111827]/5 text-[#111827]/50 rounded-full font-medium">
                +{variants.length - 3}
              </span>
            )}
          </div>
        )}

        {/* PRICE + CTA */}
        <div className="flex items-center justify-between pt-3 mt-auto border-t border-gray-100">
          <div className="pt-3">
            {!priceRange ? (
              <span className="text-green-600 font-extrabold text-base sm:text-lg tracking-tight">
                {t("products.no_price")}
              </span>
            ) : discount > 0 ? (
              <div className="flex flex-col leading-none gap-0.5">
                <span className="text-gray-400 line-through text-xs">
                  {fmtRange(priceRange.min, priceRange.max)}
                </span>
                <span className="text-rose-600 font-extrabold text-base sm:text-lg tracking-tight">
                  {fmtRange(salePrice(priceRange.min, discount), salePrice(priceRange.max, discount))}
                </span>
              </div>
            ) : (
              <span className="text-green-600 font-extrabold text-base sm:text-lg tracking-tight">
                {fmtRange(priceRange.min, priceRange.max)}
              </span>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="btn-press inline-flex items-center gap-1 text-xs sm:text-sm px-3.5 py-2 mt-3 rounded-full bg-green-600 text-white font-semibold hover:bg-yellow-400 hover:text-[#111827] transition-colors duration-300"
          >
            {t("products.view")}
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
