import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

import StarRating from "../reviews/StarRating";
import { localized } from "../../../../../Shared/utils/localize";
import { formatPrice } from "../../../../../Shared/utils/formPrice";
import { discountOf, salePrice } from "../../../../../Shared/utils/pricing";
import SaleBadge from "../../../../../Shared/components/SaleBadge";

export default function ProductInfo({ product, reviewSummary }) {
  const { t, i18n } = useTranslation();
  const ref = useRef();

  const variants = product.variants || [];
  const prices = variants.map((v) => v.price || 0).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : product.basePrice;
  const maxPrice = prices.length ? Math.max(...prices) : product.basePrice;
  const showRange = minPrice !== maxPrice;
  const discount = discountOf(product);
  const fmtRange = (mn, mx) => (mn === mx ? formatPrice(mn) : `${formatPrice(mn)} – ${formatPrice(mx)}`);

  useEffect(() => {
    gsap.fromTo(ref.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
    );
  }, []);

  return (
    <div ref={ref} className="space-y-4">

      {/* Category tag */}
      {product.category?.name && (
        <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide bg-[#111827] text-green-400 rounded-full">
          {localized(product.category, "name", i18n.language)}
        </span>
      )}

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-black text-[#111827] leading-snug tracking-tight">
        {localized(product, "name", i18n.language)}
      </h1>

      {/* Rating */}
      {reviewSummary && (
        <a href="#reviews" className="flex items-center gap-2 group">
          <StarRating value={reviewSummary.average} size="sm" />
          <span className="text-sm text-[#111827]/50 group-hover:text-green-600 transition">
            {reviewSummary.count > 0
              ? `(${reviewSummary.average} · ${reviewSummary.count} ${t("reviews.reviews_label", "reviews")})`
              : t("reviews.no_reviews_yet", "No reviews yet")}
          </span>
        </a>
      )}

      {/* Price */}
      {discount > 0 ? (
        <div className="space-y-1.5">
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-4xl font-black text-rose-600">
              {fmtRange(salePrice(minPrice, discount), salePrice(maxPrice, discount))}
            </span>
            <SaleBadge percent={discount} className="text-sm px-3 py-1" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#111827]/40 line-through">{fmtRange(minPrice, maxPrice)}</span>
            <span className="font-semibold text-rose-600">
              {t("products.save_percent", { percent: discount })}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-green-600">
            {fmtRange(minPrice, maxPrice)}
          </span>
          {product.originalPrice && product.originalPrice > minPrice && (
            <span className="text-base text-[#111827]/40 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-sm text-[#111827]/60 leading-relaxed">
        {localized(product, "description", i18n.language)}
      </p>
    </div>
  );
}
