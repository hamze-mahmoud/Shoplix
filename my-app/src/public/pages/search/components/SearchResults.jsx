import { useTranslation } from "react-i18next";
import { localized } from "../../../../Shared/utils/localize";
import { onImgError } from "../../../../Shared/utils/imageFallback";
import { formatPrice } from "../../../../Shared/utils/formPrice";

export default function SearchResults({ results, activeIndex, onSelect }) {
  const { i18n } = useTranslation();

  return (
    <>
      {results.map((item, index) => {
        const name = localized(item, "name", i18n.language) || item.name;
        const image = item.image || item.variants?.[0]?.images?.[0];
        const prices = (item.variants || []).map((v) => v.price || 0).filter(Boolean);
        const price = item.price ?? (prices.length ? Math.min(...prices) : null);

        return (
          <div
            key={item._id || index}
            onClick={() => onSelect(item)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition ${
              activeIndex === index ? "bg-gray-100" : "hover:bg-gray-50"
            }`}
          >
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {image ? (
                <img src={image} alt={name} onError={onImgError} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">📦</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#111827] line-clamp-1">{name}</p>
              {price != null && <p className="text-xs text-gray-500">{formatPrice(price)}</p>}
            </div>
          </div>
        );
      })}
    </>
  );
}
