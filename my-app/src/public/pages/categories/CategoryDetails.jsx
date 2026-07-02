import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, ArrowLeft, Layers } from "lucide-react";
import gsap from "gsap";

import { categoryService } from "../../../Shared/services/categoryService";
import { localized } from "../../../Shared/utils/localize";

import CategorySidebar from "./components/CategorySidebar";
import CategoryChildren from "./components/CategoryChildren";
import CategoryBreadcrumb from "./components/CategoryBreadcrumb";
import ProductCard from "../products/components/listing/ProductCard";

function CategorySkeleton() {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
      <div className="w-full lg:w-64 h-80 bg-white rounded-3xl border border-[#E5E7EB]" />
      <div className="flex-1 space-y-6">
        <div className="h-44 bg-white rounded-3xl border border-[#E5E7EB]" />
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white rounded-2xl border border-[#E5E7EB]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryDetails() {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const heroRef = useRef(null);

  const [category, setCategory] = useState(null);
  const [children, setChildren] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;

    let active = true;
    (async () => {
      setLoading(true);
      setNotFound(false);
      try {
        const [catRes, childrenRes] = await Promise.all([
          categoryService.getCategoryById(id),
          categoryService.getChildCategories(id),
        ]);
        if (!active) return;

        setCategory(catRes.data);
        const kids = childrenRes.data || [];
        setChildren(kids);

        if (kids.length === 0) {
          const prodRes = await categoryService.getCategoryWithProducts(id);
          if (!active) return;
          const data = prodRes.data;
          setProducts(data.products || data.category?.products || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        if (active) setNotFound(true);
        console.error("Failed to load category", err);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [id]);

  // GSAP hero entrance
  useEffect(() => {
    if (loading || !heroRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-hero]", {
        opacity: 0,
        y: 28,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, [loading, category]);

  const isLeaf = children.length === 0;

  return (
    <div className="bg-[#F8F9FA] min-h-screen text-[#111827]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {loading ? (
          <CategorySkeleton />
        ) : notFound || !category ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-sm">
            <Package className="w-14 h-14 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-[#111827] mb-2">{t("categories.not_found")}</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">{t("categories.not_found_desc")}</p>
            <Link
              to="/categories"
              className="btn-press inline-flex items-center gap-2 px-6 py-3 bg-[#111827] text-white rounded-full font-medium hover:bg-green-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t("categories.back")}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

            {/* SIDEBAR */}
            <CategorySidebar />

            {/* CONTENT */}
            <div className="flex-1 min-w-0 space-y-8">

              <CategoryBreadcrumb category={category} />

              {/* HERO — black charcoal with green accent (green / white / black) */}
              <div
                ref={heroRef}
                className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B1220] via-[#111827] to-[#0d1f17] p-8 sm:p-14"
              >
                <div className="absolute -top-24 -end-20 w-80 h-80 bg-green-500/25 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-28 -start-16 w-72 h-72 bg-green-400/15 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 text-white">
                  <span data-hero className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em] text-green-400 font-semibold mb-6">
                    <span className="w-8 h-px bg-green-400" />
                    {t("categories.browse_category")}
                  </span>

                  <h1 data-hero className="font-display font-light text-5xl sm:text-7xl leading-[0.92] tracking-tight">
                    {localized(category, "name", i18n.language)}
                  </h1>

                  {localized(category, "description", i18n.language) && (
                    <p data-hero className="mt-6 text-white/60 text-base sm:text-lg font-light max-w-xl leading-relaxed">
                      {localized(category, "description", i18n.language)}
                    </p>
                  )}

                  <div data-hero className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500/15 border border-green-400/30 px-4 py-2 text-sm font-medium text-green-100">
                    <Layers className="w-4 h-4 text-green-400" />
                    {isLeaf
                      ? t("categories.products_count", { count: products.length })
                      : t("categories.subcategories_count", { count: children.length })}
                  </div>
                </div>
              </div>

              {/* SUBCATEGORIES or PRODUCTS */}
              {!isLeaf ? (
                <CategoryChildren children={children} />
              ) : products.length > 0 ? (
                <section className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-3xl text-[#111827]">{t("categories.products")}</h2>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-semibold">
                      {t("categories.products_count", { count: products.length })}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {products.map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </section>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-[#E5E7EB] shadow-sm">
                  <Package className="w-12 h-12 text-gray-300 mb-3" />
                  <h3 className="font-bold text-[#111827]">{t("categories.no_products")}</h3>
                  <p className="text-gray-500 text-sm mt-1 max-w-xs">{t("categories.no_products_desc")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
