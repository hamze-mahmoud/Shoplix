import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, FolderOpen } from "lucide-react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { localized } from "../../../../Shared/utils/localize";
import { onImgError } from "../../../../Shared/utils/imageFallback";

gsap.registerPlugin(ScrollTrigger);

export default function CategoryChildren({ children = [] }) {
  const { t, i18n } = useTranslation();
  const gridRef = useRef(null);

  // GSAP scroll-triggered stagger entrance
  useEffect(() => {
    if (!gridRef.current || !children.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-subcard]", {
        opacity: 0,
        y: 44,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: gridRef.current, start: "top 88%", once: true },
      });
    }, gridRef);
    return () => ctx.revert();
  }, [children.length]);

  if (!children.length) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-3xl text-[#111827]">{t("categories.subcategories")}</h2>
        <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-semibold">
          {t("categories.subcategories_count", { count: children.length })}
        </span>
      </div>

      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {children.map((child) => {
          const img = child.image?.url;
          return (
            <Link
              key={child._id}
              to={`/categories/child/products/${child._id}`}
              data-subcard
              className="group relative flex flex-col overflow-hidden bg-white rounded-3xl border border-black/[0.06] shadow-sm hover:shadow-xl hover:-translate-y-1.5 hover:border-green-400 transition-all duration-300"
            >
              {/* IMAGE */}
              <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                {img ? (
                  <img
                    src={img}
                    alt={child.name}
                    loading="lazy"
                    onError={onImgError}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  // Fallback: black → green gradient with the category's emoji/icon
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#111827] to-green-700 transition-transform duration-500 group-hover:scale-105">
                    {child.icon ? (
                      <span className="text-5xl drop-shadow">{child.icon}</span>
                    ) : (
                      <FolderOpen className="w-12 h-12 text-white/85" />
                    )}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              </div>

              {/* BODY */}
              <div className="flex flex-col flex-1 p-5 sm:p-6">
                <h3 className="font-display text-2xl text-[#111827] leading-tight line-clamp-1 group-hover:text-green-700 transition-colors">
                  {localized(child, "name", i18n.language)}
                </h3>
                <p className="mt-2 text-sm text-[#111827]/55 font-light line-clamp-2 min-h-[2.5rem]">
                  {localized(child, "description", i18n.language) || t("categories.explore")}
                </p>

                <span className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-[#111827] text-white text-[11px] uppercase tracking-[0.16em] font-semibold px-5 py-2.5 group-hover:bg-green-600 transition-colors duration-300">
                  {t("categories.browse")}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
