import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, ArrowLeft, Tag } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { categoryService } from "../../../../Shared/services/categoryService";
import CategoryBreadcrumb from "./CategoryBreadcrumb";
import ProductCard from "../../products/components/listing/ProductCard";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function CategoryProductsPreview() {
  const { id } = useParams();
  const { t } = useTranslation();
  const heroRef = useRef(null);
  const gridRef = useRef(null);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let active = true;
    (async () => {
      setLoading(true);
      try {
        const res = await categoryService.getCategoryWithProducts(id);
        if (!active) return;
        setCategory(res.data.category || null);
        setProducts(res.data.products || []);
      } catch (err) {
        console.error("Failed to load category products", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [id]);

  // GSAP: hero entrance + product grid stagger.
  // Guarded so reduced-motion or a hidden tab (rAF paused) leaves everything
  // visible instead of frozen at the animation's start frame.
  useEffect(() => {
    if (loading) return;
    const heroItems = heroRef.current?.querySelectorAll("[data-hero]") || [];
    const cards = gridRef.current?.querySelectorAll("[data-pcard]") || [];
    if (prefersReducedMotion() || document.hidden) {
      gsap.set(heroItems, { opacity: 1, y: 0 });
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      if (heroItems.length) {
        gsap.fromTo(
          heroItems,
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
        );
      }
      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out",
            scrollTrigger: { trigger: gridRef.current, start: "top 88%", once: true },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [loading, products.length]);

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-44 bg-[#111827]/5 rounded-[28px]" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-72 bg-white rounded-2xl border border-[#E5E7EB]" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {category && <CategoryBreadcrumb category={category} />}

            {/* HERO — black charcoal with green accent (green / white / black) */}
            <div ref={heroRef} className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0d1f17] p-8 sm:p-14">
              <div className="absolute -top-24 -end-20 w-80 h-80 bg-green-500/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-28 -start-16 w-72 h-72 bg-green-400/15 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 text-white">
                <span data-hero className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-green-400 font-semibold mb-6">
                  <span className="w-8 h-px bg-green-400" />
                  {t("categories.products")}
                </span>

                <h1 data-hero className="font-display font-light text-5xl sm:text-7xl leading-[0.92] tracking-tight">
                  {category?.name || t("categories.products")}
                </h1>

                {category?.description && (
                  <p data-hero className="mt-6 text-white/60 text-base sm:text-lg font-light max-w-xl leading-relaxed">
                    {category.description}
                  </p>
                )}

                <div data-hero className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500/15 border border-green-400/30 px-4 py-2 text-sm font-medium text-green-100">
                  <Tag className="w-4 h-4 text-green-400" />
                  {t("categories.products_count", { count: products.length })}
                </div>
              </div>
            </div>

            {/* PRODUCTS */}
            {products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-sm">
                <Package className="w-14 h-14 text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-[#111827]">{t("categories.no_products")}</h2>
                <p className="text-gray-500 text-sm mt-1 mb-6 max-w-xs">{t("categories.no_products_desc")}</p>
                <Link
                  to="/categories"
                  className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-full font-medium hover:bg-green-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                  {t("categories.back")}
                </Link>
              </div>
            ) : (
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {products.map((product) => (
                  <div data-pcard key={product._id}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
