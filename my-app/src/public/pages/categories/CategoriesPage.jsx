import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, PackageSearch, Layers, Boxes } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { categoryService } from "../../../Shared/services/categoryService";
import { localized } from "../../../Shared/utils/localize";
import { onImgError } from "../../../Shared/utils/imageFallback";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Recursively resolve a real image from a category or its descendants.
const findImage = (category) => {
  if (!category) return null;
  if (category.image?.url) return category.image.url;
  if (Array.isArray(category.children)) {
    for (const child of category.children) {
      const img = findImage(child);
      if (img) return img;
    }
  }
  return null;
};

// Count every descendant (the whole subtree) for a category.
const countDescendants = (category) => {
  if (!Array.isArray(category?.children) || !category.children.length) return 0;
  return category.children.reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0
  );
};

// Bento span pattern — makes the first tile a large feature, with a couple of
// wide tiles for rhythm. grid-flow-dense fills any gaps regardless of count.
const tileSpan = (i) => {
  if (i === 0) return "col-span-2 row-span-2";
  if (i % 5 === 2) return "lg:col-span-2";
  return "";
};

export default function CategoriesPage() {
  const { t, i18n } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    categoryService
      .getAllCategories()
      .then((res) => setCategories(res.data || []))
      .catch((err) => console.error("Category fetch error:", err))
      .finally(() => setLoading(false));
  }, []);

  // Hero entrance — skipped (left visible) when reduced-motion or tab hidden.
  useEffect(() => {
    if (!heroRef.current) return;
    const items = heroRef.current.querySelectorAll("[data-hero]");
    if (prefersReducedMotion() || document.hidden) {
      gsap.set(items, { opacity: 1, y: 0 });
      return;
    }
    const tl = gsap.fromTo(
      items,
      { y: 26, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: "power3.out" }
    );
    return () => {
      tl.kill();
      gsap.set(items, { clearProps: "all" });
    };
  }, [loading]);

  // Grid tiles — scroll-triggered staggered reveal, robust to hidden tabs.
  useEffect(() => {
    if (!gridRef.current || !categories.length) return;
    const tiles = gridRef.current.querySelectorAll("[data-tile]");
    if (prefersReducedMotion() || document.hidden) {
      gsap.set(tiles, { opacity: 1, y: 0, scale: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 44, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 82%", once: true },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [categories.length]);

  const totalSub = categories.reduce((sum, c) => sum + countDescendants(c), 0);

  // Lead with the visually richest categories so the large feature tile is
  // always compelling: those with a (resolvable) image first, then by how many
  // subcategories they contain.
  const ordered = [...categories].sort((a, b) => {
    const imgDiff = (findImage(b) ? 1 : 0) - (findImage(a) ? 1 : 0);
    if (imgDiff !== 0) return imgDiff;
    return countDescendants(b) - countDescendants(a);
  });

  return (
    <div className="min-h-screen bg-white text-[#111827]">

      {/* ================= HERO ================= */}
      <section ref={heroRef} className="relative overflow-hidden border-b border-black/[0.06]">
        {/* green glow + black corner for the green/black/white identity */}
        <div className="absolute -top-32 -end-24 w-[28rem] h-[28rem] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 start-0 w-1.5 h-full bg-gradient-to-b from-[#16A34A] to-[#111827]" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24">
          <p data-hero className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.28em] text-[#16A34A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            {t("categories.count", { count: categories.length })}
          </p>

          <h1 data-hero className="mt-6 font-display font-light text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight">
            {t("categories.title")}
          </h1>

          <p data-hero className="mt-6 max-w-xl text-lg font-light leading-relaxed text-[#111827]/60">
            {t("categories.subtitle")}
          </p>

          {/* stat strip — unique editorial touch */}
          {!loading && categories.length > 0 && (
            <div data-hero className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#111827] text-white flex items-center justify-center">
                  <Boxes className="w-5 h-5" />
                </span>
                <div className="leading-none">
                  <p className="font-display text-2xl">{categories.length}</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#111827]/50 mt-1">
                    {t("categories.main_label")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </span>
                <div className="leading-none">
                  <p className="font-display text-2xl">{totalSub}</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#111827]/50 mt-1">
                    {t("categories.sub_label")}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ================= GRID ================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-14 sm:py-20">

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[200px] sm:auto-rows-[260px] grid-flow-dense gap-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-3xl bg-[#F1F3F5] animate-pulse ${i === 0 ? "col-span-2 row-span-2" : ""}`}
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] text-white flex items-center justify-center mb-6">
              <PackageSearch className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl">{t("categories.empty")}</h2>
            <p className="mt-3 text-[#111827]/55 max-w-sm">{t("categories.empty_desc")}</p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[200px] sm:auto-rows-[260px] grid-flow-dense gap-4 sm:gap-5"
          >
            {ordered.map((cat, index) => {
              const img = findImage(cat);
              const feature = index === 0;
              const subCount = Array.isArray(cat.children) ? cat.children.length : 0;
              const name = localized(cat, "name", i18n.language);

              return (
                <Link
                  key={cat._id}
                  to={`/categories/${cat._id}`}
                  data-tile
                  className={`group relative overflow-hidden rounded-[28px] bg-[#0a0f0a] ring-1 ring-black/5 shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_60px_-20px_rgba(16,163,74,0.45)] hover:ring-2 hover:ring-green-500/70 ${tileSpan(index)}`}
                >
                  {/* MEDIA — crisp, vividness-boosted */}
                  {img ? (
                    <img
                      src={img}
                      alt={name}
                      loading="lazy"
                      onError={onImgError}
                      className="absolute inset-0 h-full w-full object-cover saturate-[1.1] transition-all duration-[800ms] ease-out group-hover:scale-110 group-hover:saturate-150 group-hover:brightness-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 flex items-center justify-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage:
                          "radial-gradient(120% 100% at 18% 12%, rgba(34,197,94,0.55) 0%, transparent 46%)," +
                          "radial-gradient(120% 120% at 85% 82%, rgba(5,150,105,0.5) 0%, transparent 52%)," +
                          "linear-gradient(140deg, #0a0f0a 0%, #06301d 100%)",
                      }}
                    >
                      <div className={`rounded-[26px] bg-white/10 backdrop-blur-md border border-white/15 shadow-2xl flex items-center justify-center ${feature ? "w-28 h-28" : "w-20 h-20"}`}>
                        {cat.icon ? (
                          <span className={`drop-shadow ${feature ? "text-6xl" : "text-4xl"}`}>{cat.icon}</span>
                        ) : (
                          <Boxes className={`text-white/85 ${feature ? "w-14 h-14" : "w-10 h-10"}`} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* TOP SCRIM (only enough for chip/index legibility) */}
                  <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
                  {/* GREEN HOVER WASH */}
                  <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/15 transition-colors duration-500" />
                  {/* DIAGONAL SHINE SWEEP on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />

                  {/* INDEX — glass pill */}
                  <span className={`absolute top-4 end-4 inline-flex items-center rounded-full bg-black/25 backdrop-blur-md border border-white/15 font-display text-white/85 ${feature ? "px-3.5 h-9 text-lg" : "px-3 h-7 text-sm"}`}>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* SUBCATEGORY CHIP — glass */}
                  {subCount > 0 && (
                    <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 rounded-full bg-black/25 backdrop-blur-md border border-white/15 px-3 py-1.5 text-[11px] font-semibold text-white">
                      <Layers className="w-3.5 h-3.5 text-green-300" />
                      {t("categories.subcategories_count", { count: subCount })}
                    </span>
                  )}

                  {/* GLASS INFO PANEL — hidden by default, revealed on hover */}
                  <div className={`absolute inset-x-3 bottom-3 rounded-3xl bg-black/40 backdrop-blur-xl border border-white/20 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-400 ease-out ${feature ? "p-5 sm:p-6" : "p-4"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className={`min-w-0 truncate font-display leading-none text-white ${feature ? "text-4xl sm:text-5xl" : "text-2xl"}`}>
                        {name}
                      </h2>

                      {/* circular arrow — green */}
                      <span className={`shrink-0 rounded-full bg-green-500 border border-green-400 flex items-center justify-center text-white shadow-lg shadow-green-500/40 ${feature ? "w-12 h-12" : "w-10 h-10"}`}>
                        <ArrowUpRight className={`rtl:-scale-x-100 ${feature ? "w-6 h-6" : "w-5 h-5"}`} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
