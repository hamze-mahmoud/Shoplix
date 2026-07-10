import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatPrice } from "../../../../../Shared/utils/formPrice";
import { localized } from "../../../../../Shared/utils/localize";

export default function RecommendedProductCard({ product }) {
  const { i18n } = useTranslation();
  const name = localized(product, "name", i18n.language) || product.name;
  // get all prices from variants
  const prices = product.variants?.map(v => v.price) || [];

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const image =
    product.variants?.[0]?.images?.[0] || null;

  return (
    <Link
      to={`/products/${product._id}`}
      className="
        min-w-[180px]
        bg-white
        rounded-2xl
        p-3
        shadow-sm
        hover:shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
        border border-gray-100
        group
      "
    >
      {/* IMAGE */}
      <div className="h-32 flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={name}
            className="
              h-full
              object-contain
              group-hover:scale-105
              transition-transform
              duration-300
            "
          />
        ) : (
          <div className="text-xs text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* INFO */}
      <div className="mt-3 space-y-1">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
          {name}
        </h3>

        {/* PRICE */}
        <p className="text-sm font-bold text-green-600">
          {minPrice === maxPrice
            ? formatPrice(minPrice)
            : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
        </p>

        {/* SMALL VARIANT INFO */}
        <p className="text-xs text-gray-400">
          {product.variants?.length} variants
        </p>
      </div>
    </Link>
  );
}