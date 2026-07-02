import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * CategoryCarousel — a premium, draggable horizontal category slider.
 *  • Arrow navigation with disabled end-states
 *  • Pointer/touch drag-to-scroll (click is suppressed after a drag)
 *  • Scroll-progress indicator
 *  • GSAP scroll-triggered stagger entrance (respects reduced-motion)
 *
 * categories: [{ _id, name, description? }]
 * images: string[]  (curated fallback imagery, cycled by index)
 */
export default function CategoryCarousel({ categories = [], images = [], loading = false }) {
  const { t } = useTranslation();
  const railRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: false });

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [progress, setProgress] = useState(0);

  // ---- scroll state (arrows + progress) ----
  const syncScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const max = rail.scrollWidth - rail.clientWidth;
    const left = Math.abs(rail.scrollLeft); // abs() tolerates RTL negative scroll
    setAtStart(left <= 8);
    setAtEnd(left >= max - 8);
    setProgress(max > 0 ? left / max : 0);
  }, []);

  useEffect(() => {
    syncScroll();
    const rail = railRef.current;
    if (!rail) return;
    rail.addEventListener("scroll", syncScroll, { passive: true });
    window.addEventListener("resize", syncScroll);
    return () => {
      rail.removeEventListener("scroll", syncScroll);
      window.removeEventListener("resize", syncScroll);
    };
  }, [syncScroll, categories.length]);

  const scrollByCards = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-cat-card]");
    const amount = card ? card.offsetWidth + 20 : 320;
    rail.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  // ---- drag to scroll ----
  const onPointerDown = (e) => {
    const rail = railRef.current;
    if (!rail) return;
    drag.current = { active: true, startX: e.clientX, startLeft: rail.scrollLeft, moved: false };
  };
  const onPointerMove = (e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    railRef.current.scrollLeft = drag.current.startLeft - dx;
  };
  const endDrag = () => { drag.current.active = false; };
  // Suppress the card's navigation if the pointer was dragged
  const onCardClick = (e) => { if (drag.current.moved) e.preventDefault(); };

  // ---- GSAP scroll-triggered stagger entrance ----
  useEffect(() => {
    if (loading || !categories.length || !railRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-cat-card]", {
        opacity: 0,
        y: 48,
        duration: 0.8,
        stagger: 0.09,
        ease: "power3.out",
        scrollTrigger: { trigger: railRef.current, start: "top 85%", once: true },
      });
    }, railRef);
    return () => ctx.revert();
  }, [categories.length, loading]);

  return (
    <div className="relative">
      {/* Arrow controls (top-end, aligned over the section heading row) */}
      <div className="absolute -top-14 end-0 flex gap-2">
        <button
          onClick={() => scrollByCards(-1)}
          disabled={atStart}
          aria-label="Previous categories"
          className="btn-press w-11 h-11 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-yellow-400 hover:text-[#111827] hover:border-yellow-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white disabled:hover:border-white/25"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
        </button>
        <button
          onClick={() => scrollByCards(1)}
          disabled={atEnd}
          aria-label="Next categories"
          className="btn-press w-11 h-11 rounded-full border border-white/25 text-white flex items-center justify-center hover:bg-yellow-400 hover:text-[#111827] hover:border-yellow-400 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white disabled:hover:border-white/25"
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* RAIL */}
      <div
        ref={railRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 -mx-1 px-1 cursor-grab active:cursor-grabbing select-none touch-pan-x"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} data-cat-card className="shrink-0 w-[72%] sm:w-[46%] lg:w-[31%] aspect-[3/4] bg-[#E5E7EB] animate-pulse" />
            ))
          : categories.map((cat, i) => (
              <Link
                key={cat._id}
                to={`/categories/${cat._id}`}
                data-cat-card
                onClick={onCardClick}
                draggable={false}
                className="group relative shrink-0 w-[72%] sm:w-[46%] lg:w-[31%] snap-start"
              >
                <div className="img-zoom relative aspect-[3/4] bg-[#E5E7EB] overflow-hidden">
                  <img
                    src={images[i % images.length]}
                    alt={cat.name}
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                  {/* gradient + hover darken */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent transition-opacity duration-500 group-hover:from-black/75" />

                  {/* editorial index */}
                  <span className="absolute top-5 start-6 font-display text-2xl text-white/45">
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* hover "explore" pill */}
                  <span className="absolute top-5 end-6 w-10 h-10 rounded-full bg-white/0 group-hover:bg-white text-white group-hover:text-[#111827] flex items-center justify-center transition-all duration-500 opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0">
                    <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
                  </span>

                  {/* caption */}
                  <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 text-white">
                    <p className="text-[10px] uppercase tracking-[0.22em] text-white/65">
                      {t("home.collections_label")}
                    </p>
                    <h3 className="font-display text-3xl mt-1.5 leading-none flex items-center gap-2">
                      {cat.name}
                      <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 rtl:rotate-180 transition-all duration-500" />
                    </h3>
                    <p className="mt-2 text-sm text-white/65 font-light line-clamp-1 max-w-[16rem]">
                      {cat.description || t("categories.explore")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
      </div>

      {/* Scroll-progress indicator */}
      {!loading && categories.length > 1 && (
        <div className="mt-7 h-px bg-white/15 relative overflow-hidden">
          <div
            className="absolute inset-y-0 start-0 bg-yellow-400 transition-[width] duration-150 ease-out"
            style={{ width: `${Math.max(12, progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
