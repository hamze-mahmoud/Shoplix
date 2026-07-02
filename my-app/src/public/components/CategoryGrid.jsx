import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Boxes } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { localized } from "../../Shared/utils/localize";
import { onImgError } from "../../Shared/utils/imageFallback";

gsap.registerPlugin(ScrollTrigger);

/**
 * CategoryGrid — modern green/white/black category grid for the home page.
 *
 * Each tile shows the category image (parents inherit their child's image via
 * the /categories/showcase endpoint). Categories with no resolvable image fall
 * back to a black→green gradient tile with their emoji icon.
 *
 * categories: [{ _id, name, description?, icon?, isRoot?, image?: { url } }]
 */
export default function CategoryGrid({ categories = [], loading = false }) {
  const { t, i18n } = useTranslation();
  const gridRef = useRef(null);

  useEffect(() => {
    if (loading || !categories.length || !gridRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-cat-tile]", {
        opacity: 0,
        y: 28,
        duration: 0.6,
        stagger: 0.05,
        ease: "power3.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 85%", once: true },
      });
    }, gridRef);
    return () => ctx.revert();
  }, [categories.length, loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-square rounded-2xl bg-black/[0.06] animate-pulse" />
            <div className="h-3 w-2/3 mx-auto bg-black/[0.06] rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
      {categories.map((cat) => {
        const img = cat.image?.url;
        return (
          <Link
            key={cat._id}
            to={`/categories/${cat._id}`}
            data-cat-tile
            className="group block text-center"
          >
            {/* TILE */}
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-black/[0.07] bg-white shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl group-hover:ring-2 group-hover:ring-green-500/70">
              {img ? (
                <>
                  <img
                    src={img}
                    alt={cat.name}
                    loading="lazy"
                    onError={onImgError}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />
                </>
              ) : (
                // Fallback: black → green gradient with the category's emoji/icon
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111827] to-green-700 transition-transform duration-500 group-hover:scale-105">
                  {cat.icon ? (
                    <span className="text-4xl sm:text-5xl drop-shadow">{cat.icon}</span>
                  ) : (
                    <Boxes className="w-10 h-10 text-white/85" />
                  )}
                </div>
              )}

              {/* hover explore badge */}
              <span className="absolute top-2.5 end-2.5 w-8 h-8 rounded-full bg-white text-[#111827] flex items-center justify-center shadow-md opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
              </span>

              {/* sub-category tag */}
              {cat.isRoot === false && (
                <span className="absolute bottom-2.5 start-2.5 text-[9px] uppercase tracking-[0.15em] font-semibold text-white/90 bg-green-600/90 px-2 py-0.5 rounded-full">
                  {t("home.subcategory_tag")}
                </span>
              )}
            </div>

            {/* NAME */}
            <h3 className="mt-3 text-sm sm:text-[15px] font-semibold text-[#111827] group-hover:text-green-600 transition-colors line-clamp-1">
              {localized(cat, "name", i18n.language)}
            </h3>
          </Link>
        );
      })}
    </div>
  );
}
