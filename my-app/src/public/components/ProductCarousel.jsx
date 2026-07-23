import { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, Star, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { localized } from "../../Shared/utils/localize";
import { onImgError } from "../../Shared/utils/imageFallback";
import { formatPrice } from "../../Shared/utils/formPrice";
import { discountOf, salePrice } from "../../Shared/utils/pricing";
import SaleBadge from "../../Shared/components/SaleBadge";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Precise partial-fill star rating (green / black / white) */
function Stars({ value = 0, count = 0, t }) {
  const pct = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex">
        <div className="flex gap-0.5 text-gray-300">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="w-3.5 h-3.5 shrink-0" fill="currentColor" strokeWidth={0} />
          ))}
        </div>
        <div className="absolute inset-0 overflow-hidden flex gap-0.5 text-green-500" style={{ width: `${pct}%` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} className="w-3.5 h-3.5 shrink-0" fill="currentColor" strokeWidth={0} />
          ))}
        </div>
      </div>
      {count > 0 ? (
        <span className="text-xs text-[#111827]/55">
          <b className="text-[#111827] font-semibold">{Number(value).toFixed(1)}</b> ({count})
        </span>
      ) : (
        <span className="text-[10px] uppercase tracking-[0.16em] text-[#111827]/35 font-semibold">
          {t("products.new")}
        </span>
      )}
    </div>
  );
}

/**
 * Horizontal product slider with arrow controls and scroll-snap.
 * 2027 glassmorphism cards with ratings.
 */
export default function ProductCarousel({ products = [], showSold = false }) {
  const { t, i18n } = useTranslation();
  const railRef = useRef(null);

  // `dir` is semantic: -1 = toward previous items, +1 = toward next items —
  // always in READING order, regardless of language. Modern browsers run
  // scrollLeft NEGATIVE toward "next" under dir=rtl (the opposite sign
  // convention from LTR), so the sign must be flipped in RTL or the arrows
  // scroll backwards in Arabic/Hebrew even though their icons point the
  // right way.
  const scrollByCards = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-card]");
    const amount = card ? card.offsetWidth + 20 : 320;
    const isRTL = i18n.dir?.() === "rtl";
    rail.scrollBy({ left: (isRTL ? -dir : dir) * amount, behavior: "smooth" });
  };

  // GSAP staggered reveal — robust to reduced-motion / hidden tab
  useEffect(() => {
    if (!railRef.current || !products.length) return;
    const cards = railRef.current.querySelectorAll("[data-card]");
    if (prefersReducedMotion() || document.hidden) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 36 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
          scrollTrigger: { trigger: railRef.current, start: "top 88%", once: true },
        }
      );
    }, railRef);
    return () => ctx.revert();
  }, [products.length]);

  if (!products.length) return null;

  return (
    <div className="relative">
      {/* Arrows */}
      <div className="absolute -top-14 end-0 flex gap-2">
        <button
          onClick={() => scrollByCards(-1)}
          aria-label="Scroll left"
          className="w-10 h-10 rounded-full border border-[#111827]/20 flex items-center justify-center hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] active:scale-90 transition-all"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <button
          onClick={() => scrollByCards(1)}
          aria-label="Scroll right"
          className="w-10 h-10 rounded-full border border-[#111827]/20 flex items-center justify-center hover:bg-[#16A34A] hover:text-white hover:border-[#16A34A] active:scale-90 transition-all"
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      <div
        ref={railRef}
        className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        {products.map((p) => {
          const img = p.image || p.variants?.[0]?.images?.[0];
          const variants = p.variants || [];
          const prices = variants.map((v) => v.price || 0).filter(Boolean);
          const price = prices.length ? Math.min(...prices) : p.basePrice;
          const discount = discountOf(p);
          const rating = p.ratingAvg || 0;
          const reviews = p.ratingCount || 0;

          return (
            <Link
              key={p._id}
              to={`/products/${p._id}`}
              data-card
              className="group shrink-0 w-[68%] sm:w-[42%] lg:w-[23%] snap-start"
            >
              {/* MEDIA */}
              <div className="relative aspect-square rounded-[26px] overflow-hidden bg-gray-100 ring-1 ring-black/[0.06] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-22px_rgba(16,163,74,0.45)] group-hover:ring-2 group-hover:ring-green-500/60">
                {img ? (
                  <img
                    src={img}
                    alt={p.name}
                    loading="lazy"
                    onError={onImgError}
                    className="absolute inset-0 h-full w-full object-cover saturate-[1.08] transition-all duration-[800ms] ease-out group-hover:scale-110 group-hover:saturate-150 group-hover:brightness-105"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center text-white/20 text-6xl"
                    style={{
                      backgroundImage:
                        "radial-gradient(120% 100% at 20% 12%, rgba(34,197,94,0.4) 0%, transparent 48%)," +
                        "linear-gradient(140deg, #0a0f0a 0%, #06301d 100%)",
                    }}
                  >
                    ◇
                  </div>
                )}

                {/* diagonal shine sweep on hover */}
                <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12" />

                {/* top-start badges: SALE + SOLD */}
                <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5">
                  {discount > 0 && <SaleBadge percent={discount} />}
                  {showSold && p.sold > 0 && (
                    <span className="inline-flex items-center rounded-full bg-black/40 backdrop-blur-md border border-white/15 text-white text-[10px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1">
                      {t("home.sold_badge", { count: p.sold })}
                    </span>
                  )}
                </div>

                {/* rating glass chip */}
                {reviews > 0 && (
                  <span className="absolute top-3 end-3 inline-flex items-center gap-1 rounded-full bg-black/35 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
                    <Star className="w-3 h-3 text-green-400" fill="currentColor" strokeWidth={0} />
                    {Number(rating).toFixed(1)}
                  </span>
                )}

                {/* hover glass "view product" bar */}
                <div className="absolute inset-x-3 bottom-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/20 px-4 py-3 flex items-center justify-between text-white opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400">
                  <span className="text-[11px] uppercase tracking-[0.18em] font-semibold">{t("products.view_product")}</span>
                  <span className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                  </span>
                </div>
              </div>

              {/* CONTENT */}
              <div className="mt-4 px-0.5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[#111827]/40">
                  {localized(p.category, "name", i18n.language) || t("products.uncategorized")}
                </p>
                <h3 className="font-display text-xl mt-1 leading-snug group-hover:text-[#16A34A] transition-colors line-clamp-1">
                  {localized(p, "name", i18n.language)}
                </h3>
                <div className="mt-2">
                  <Stars value={rating} count={reviews} t={t} />
                </div>
                {discount > 0 ? (
                  <p className="mt-2 flex items-baseline gap-2">
                    <span className="text-[15px] font-bold text-rose-600">{formatPrice(salePrice(price, discount))}</span>
                    <span className="text-xs text-[#111827]/40 line-through">{formatPrice(price)}</span>
                  </p>
                ) : (
                  <p className="mt-2 text-[15px] font-semibold text-[#111827]">{formatPrice(price)}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
