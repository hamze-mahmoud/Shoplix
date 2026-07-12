import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Flame, Sparkles, ArrowRight, MessageCircle } from "lucide-react";
import gsap from "gsap";

import { offerService } from "../../Shared/services/offerService";
import { localized } from "../../Shared/utils/localize";
import Countdown from "../../Shared/components/Countdown";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A thin, premium rotating promo strip above the navbar. Cycles through the
// store's LIVE special offers (with a ticking countdown), a "picked for you"
// teaser, free-shipping, and the WhatsApp assistant — the first thing a
// visitor sees, built to catch the eye and pull them deeper in.
export default function PromoBar({ collapsed = false }) {
  const { t, i18n } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slideRef = useRef(null);

  useEffect(() => {
    offerService
      .getOffers()
      .then((r) => setOffers((r.data?.data || []).slice(0, 3)))
      .catch(() => setOffers([]));
  }, []);

  // Build the rotating slide list: live offers first, then evergreen promos.
  const slides = [
    ...offers.map((o) => ({ type: "offer", offer: o })),
    { type: "tailored" },
    { type: "whatsapp" },
  ];

  // Auto-rotate (pauses on hover / reduced-motion).
  useEffect(() => {
    if (paused || prefersReducedMotion() || slides.length <= 1) return;
    const id = setInterval(() => setIdx((p) => (p + 1) % slides.length), 4200);
    return () => clearInterval(id);
  }, [paused, slides.length]);

  // Slide-in animation on each change.
  useEffect(() => {
    if (!slideRef.current || prefersReducedMotion()) return;
    const dir = i18n.dir?.() === "rtl" ? -14 : 14;
    gsap.fromTo(
      slideRef.current,
      { x: dir, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
    );
  }, [idx, i18n]);

  if (!slides.length) return null;
  const slide = slides[idx % slides.length];

  // Each slide renders its inner content (icon + message [+ countdown]) and the
  // href it links to.
  const render = () => {
    switch (slide.type) {
      case "offer": {
        const o = slide.offer;
        return {
          to: `/offers/${o._id}`,
          node: (
            <>
              <Flame className="w-4 h-4 text-amber-300 animate-pulse shrink-0" />
              <span className="font-semibold truncate max-w-[38vw] sm:max-w-none">
                {localized(o, "title", i18n.language) || o.title}
              </span>
              {o.savingsPercent > 0 && (
                <span className="inline-flex items-center rounded-full bg-amber-400 text-[#111827] text-[11px] font-bold px-2 py-0.5 shrink-0">
                  -{o.savingsPercent}%
                </span>
              )}
              <Countdown until={o.endDate} mode="chip" variant="dark" className="hidden sm:inline-flex" />
              <span className="hidden sm:inline font-semibold underline-offset-2 group-hover:underline">
                {t("promo.shop_now", "Shop now")}
              </span>
            </>
          ),
        };
      }
      case "tailored":
        return {
          to: "/tailored",
          node: (
            <>
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{t("promo.tailored", "Products picked just for you")}</span>
              <span className="hidden sm:inline opacity-80">{t("promo.tailored_cta", "Discover your personalized picks")}</span>
            </>
          ),
        };
      case "whatsapp":
      default:
        return {
          to: "/contact",
          node: (
            <>
              <MessageCircle className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-semibold">{t("promo.whatsapp", "New: shop by chatting with our AI assistant on WhatsApp")}</span>
            </>
          ),
        };
    }
  };

  const { to, node } = render();

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`overflow-hidden transition-all duration-300 ease-out ${
        collapsed ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
      }`}
    >
      <div className="relative bg-gradient-to-r from-[#0b1120] via-[#14532d] to-[#0b1120] text-white">
        {/* moving sheen */}
        <span className="pointer-events-none absolute inset-y-0 -inset-x-1/2 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent animate-[promo-sheen_6s_linear_infinite]" />
        <div className="relative max-w-7xl mx-auto px-4 h-10 flex items-center justify-center">
          <Link
            to={to}
            ref={slideRef}
            key={idx}
            className="group inline-flex items-center gap-2 text-[12.5px] sm:text-sm leading-none"
          >
            {node}
            <ArrowRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-1 transition-transform rtl:rotate-180 shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
