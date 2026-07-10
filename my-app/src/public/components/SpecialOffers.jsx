import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { Sparkles, ArrowRight, Package } from "lucide-react";

import { offerService } from "../../Shared/services/offerService";
import { formatPrice } from "../../Shared/utils/formPrice";
import { localized } from "../../Shared/utils/localize";
import { onImgError } from "../../Shared/utils/imageFallback";

// three.js backdrop lives in its own lazy chunk
const OffersBackground3D = lazy(() => import("./OffersBackground3D"));

// Home "Special Offers" band: a scroll rail of live bundle offers on a dark
// premium stage with a floating-gem three.js backdrop and GSAP entrance.
// Renders nothing when there are no active offers.
export default function SpecialOffers() {
  const { t, i18n } = useTranslation();
  const rootRef = useRef(null);
  const [offers, setOffers] = useState([]);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    offerService
      .getOffers()
      .then((res) => setOffers(res.data.data || []))
      .catch(() => setOffers([]));
  }, []);

  // Reveal heading + cards when the section enters the viewport. Uses an
  // IntersectionObserver (fires reliably whenever the section becomes visible,
  // regardless of async load / 3D-canvas layout timing) instead of a
  // ScrollTrigger, which could leave the card stuck invisible. A safety timer
  // guarantees the offer is NEVER left hidden even in edge cases.
  useEffect(() => {
    if (!offers.length || !rootRef.current) return;
    const els = rootRef.current.querySelectorAll("[data-so-head], [data-so-card]");
    if (reduced || !els.length) return;

    gsap.set(els, { opacity: 0, y: 34 });

    const reveal = () =>
      gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        overwrite: true,
      });

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(rootRef.current);

    // Absolute fallback: if the observer never fires, show everything.
    const safety = setTimeout(() => gsap.set(els, { opacity: 1, y: 0 }), 2000);

    return () => {
      io.disconnect();
      clearTimeout(safety);
    };
  }, [offers.length, reduced]);

  if (!offers.length) return null;

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[#0b1120] text-white py-20 sm:py-28"
    >
      {/* 3D backdrop (skipped for reduced motion) */}
      {!reduced && (
        <div className="absolute inset-0 opacity-70 pointer-events-none">
          <Suspense fallback={null}>
            <OffersBackground3D />
          </Suspense>
        </div>
      )}
      {/* gradient veils to keep text legible over the gems */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0b1120] via-[#0b1120]/30 to-[#0b1120]" />
      <div className="absolute inset-x-0 bottom-0 h-40 pointer-events-none bg-gradient-to-t from-[#0b1120] to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-10">
        {/* HEADER */}
        <div data-so-head className="flex flex-wrap items-end justify-between gap-6 mb-10 sm:mb-14">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-blue-300">
              <Sparkles className="w-4 h-4" />
              {t("home.offers_kicker")}
            </p>
            <h2 className="font-display text-4xl sm:text-6xl mt-3 leading-[1.05]">
              {t("home.offers_title")}
            </h2>
            <p className="text-white/55 mt-3 max-w-lg">{t("home.offers_subtitle")}</p>
          </div>
          <Link
            to="/offers"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-sm font-semibold hover:bg-white hover:text-[#0b1120] transition-colors duration-300"
          >
            {t("home.offers_view_all")}
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {/* OFFER RAIL */}
        <div className="flex gap-5 overflow-x-auto pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 snap-x snap-mandatory no-scrollbar">
          {offers.map((o) => (
            <Link
              data-so-card
              key={o._id}
              to={`/offers/${o._id}`}
              className="group snap-start shrink-0 w-[280px] sm:w-[320px] rounded-3xl overflow-hidden bg-white/[0.06] backdrop-blur-sm border border-white/10 hover:border-blue-400/50 hover:-translate-y-1.5 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                {o.images?.[0] ? (
                  <img
                    src={o.images[0]}
                    alt={localized(o, "title", i18n.language) || o.title}
                    onError={onImgError}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Package className="w-10 h-10" />
                  </div>
                )}
                {o.savingsPercent > 0 && (
                  <span className="absolute top-3 start-3 bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    -{o.savingsPercent}%
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-display text-xl leading-snug line-clamp-1">
                  {localized(o, "title", i18n.language) || o.title}
                </h3>
                <p className="text-white/45 text-sm mt-1">
                  {o.products?.length} {t("offers.items_included")}
                </p>
                <div className="flex items-end gap-2 mt-4">
                  <span className="text-2xl font-bold text-blue-300">{formatPrice(o.offerPrice)}</span>
                  {o.originalTotal > o.offerPrice && (
                    <span className="text-sm text-white/35 line-through mb-1">{formatPrice(o.originalTotal)}</span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 mt-4 group-hover:text-blue-300 transition-colors">
                  {t("offers.view_offer")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform rtl:rotate-180" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* mobile "view all" */}
        <Link
          to="/offers"
          className="sm:hidden mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/20 text-sm font-semibold hover:bg-white hover:text-[#0b1120] transition-colors"
        >
          {t("home.offers_view_all")}
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </Link>
      </div>
    </section>
  );
}
