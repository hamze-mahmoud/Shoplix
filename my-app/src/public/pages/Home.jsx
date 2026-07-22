import { useEffect, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, ShieldCheck, BadgeCheck, Lock } from "lucide-react";

import Reveal from "../../Shared/components/Reveal";
import HeroSlider from "../components/HeroSlider";
import ProductCarousel from "../components/ProductCarousel";
import CategoryMarquee from "../components/CategoryMarquee";
import { categoryService } from "../../Shared/services/categoryService";
import { productService } from "../../Shared/services/productService";
import { bannerService } from "../../Shared/services/bannerService";
import { localized } from "../../Shared/utils/localize";
import { formatPrice } from "../../Shared/utils/formPrice";
import { discountOf, salePrice } from "../../Shared/utils/pricing";
import SaleBadge from "../../Shared/components/SaleBadge";

// three.js showcase is heavy — load it in its own chunk, render when ready
const Showcase3D = lazy(() => import("../components/Showcase3D"));
// Special Offers band (own chunk — also pulls three.js lazily)
const SpecialOffers = lazy(() => import("../components/SpecialOffers"));
// AI "picked for you" teaser rail
const SmartPicks = lazy(() => import("../components/SmartPicks"));

export default function Home() {
  const { t, i18n } = useTranslation();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [banners, setBanners] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategoriesShowcase()
      .then((res) => setCategories(res.data || []))
      .finally(() => setCatLoading(false));

    productService.getFeaturedProducts()
      .then((res) => setProducts(res.data || []))
      .finally(() => setProdLoading(false));

    productService.getBestSellers({ limit: 10 })
      .then((res) => setBestSellers(res.data || []));

    // Admin-managed hero banners; the hardcoded slides below stay as fallback
    bannerService.getBanners()
      .then((res) => setBanners(res.data?.data || []))
      .catch(() => {});
  }, []);

  // Slides from the admin-managed banners, in the visitor's language.
  const bannerSlides = banners.map((b) => ({
    img: b.image,
    kicker: localized(b, "kicker", i18n.language),
    title: localized(b, "title", i18n.language),
    title2: localized(b, "title2", i18n.language),
    sub: localized(b, "subtitle", i18n.language),
    cta: localized(b, "cta", i18n.language) || t("home.lux_cta_shop"),
    to: b.link || "/products",
  }));

  const fallbackSlides = [
    {
      img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&q=80",
      kicker: t("home.sale_kicker"),
      title: t("home.sale_title"),
      title2: t("home.sale_title2"),
      sub: t("home.sale_sub"),
      cta: t("home.sale_cta"),
      to: "/products",
    },
    {
      img: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1600&q=80",
      kicker: t("home.lux_kicker"),
      title: t("home.lux_title"),
      title2: t("home.lux_title2"),
      sub: t("home.lux_subtitle"),
      cta: t("home.lux_cta_shop"),
      to: "/products",
    },
    {
      img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1600&q=80",
      kicker: t("home.best_kicker"),
      title: t("home.best_title"),
      title2: t("home.best_title2"),
      sub: t("home.best_sub"),
      cta: t("home.best_cta"),
      to: "/products",
    },
  ];

  const slides = bannerSlides.length ? bannerSlides : fallbackSlides;

  const trust = [
    { icon: BadgeCheck, label: t("home.trust_authentic") },
    { icon: ShieldCheck, label: t("home.trust_warranty") },
    { icon: Lock, label: t("home.trust_secure") },
  ];

  // 3D showcase feed: featured first, topped up with best sellers (unique).
  const showcaseProducts = [
    ...products,
    ...bestSellers.filter((b) => !products.some((p) => p._id === b._id)),
  ];

  return (
    <div className="bg-[#F8F9FA] text-[#111827]">

      {/* ================= HERO ================= */}
      <HeroSlider slides={slides} />

      {/* ================= 3D SHOWCASE ================= */}
      <Suspense fallback={null}>
        <Showcase3D products={showcaseProducts} />
      </Suspense>

      {/* ================= TRUST ================= */}
      <section className="border-y border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-3 divide-x divide-black/10">
          {trust.map(({ icon: Icon, label }, i) => (
            <div key={i} className="flex items-center justify-center gap-3 py-6">
              <Icon className="w-4 h-4 text-green-600" />
              <span className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-black/60">
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ================= SPECIAL OFFERS ================= */}
      <Suspense fallback={null}>
        <SpecialOffers />
      </Suspense>

      {/* ================= BEST SELLERS ================= */}
      {bestSellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-28">
          <Reveal className="max-w-2xl mb-10 sm:mb-14">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {t("home.bestsellers_label")}
            </p>
            <h2 className="text-3xl sm:text-5xl font-light leading-tight mt-4">
              {t("home.bestsellers_title")}
            </h2>
            <p className="mt-5 text-black/60 leading-relaxed">
              {t("home.bestsellers_sub")}
            </p>
          </Reveal>

          <ProductCarousel products={bestSellers} showSold />
        </section>
      )}

      {/* ================= AI PICKS (tailored teaser) ================= */}
      <Suspense fallback={null}>
        <SmartPicks />
      </Suspense>

      {/* ================= CATEGORIES (green / white / black grid) ================= */}
      <section className="relative overflow-hidden bg-white border-y border-black/[0.06]">
        {/* soft green glows for depth */}
        <div className="absolute -top-32 -start-32 w-96 h-96 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -end-32 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-28">
          <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 sm:mb-14">
            <div className="max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-green-600 font-semibold">
                <span className="w-6 h-px bg-green-600" />
                {t("home.collections_label")}
              </p>
              <h2 className="text-3xl sm:text-5xl font-light mt-4 text-[#111827]">
                {t("home.collections_title")}
              </h2>
              <p className="mt-5 text-black/60">
                {t("home.collections_sub")}
              </p>
            </div>

            <Link
              to="/categories"
              className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#111827] text-white text-xs uppercase tracking-[0.2em] font-semibold hover:bg-green-600 transition-colors"
            >
              {t("home.view_all_categories")} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </Reveal>

          <CategoryMarquee categories={categories} loading={catLoading} />
        </div>
      </section>

      {/* ================= FEATURED ================= */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-28">
        <Reveal className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-end mb-10 sm:mb-14">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#111827]">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              {t("home.featured_label")}
            </p>
            <h2 className="text-3xl sm:text-5xl font-light mt-4">
              {t("home.featured_title")}
            </h2>
          </div>

          <Link
            to="/products"
            className="text-xs uppercase tracking-[0.25em] text-black/60 hover:text-green-600 transition"
          >
            {t("home.view_all")} →
          </Link>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {prodLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-black/5 rounded-xl mb-4" />
                  <div className="h-2 w-1/3 bg-black/10 mb-2" />
                  <div className="h-3 w-2/3 bg-black/10" />
                </div>
              ))
            : products.slice(0, 4).map((p, i) => {
                const img = p.variants?.[0]?.images?.[0];
                const discount = discountOf(p);

                return (
                  <Reveal key={p._id} delay={i * 0.06}>
                    <Link
                      to={`/products/${p._id}`}
                      className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                    >
                      <div className="relative aspect-square overflow-hidden bg-black/5">
                        {discount > 0 && <SaleBadge percent={discount} floating />}
                        {img ? (
                          <img
                            src={img}
                            alt={localized(p, "name", i18n.language) || p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-black/10 text-4xl">
                            ◇
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-black/40">
                          {localized(p.category, "name", i18n.language) || p.category?.name}
                        </p>

                        <h3 className="mt-1 text-lg font-light group-hover:text-green-600 transition">
                          {localized(p, "name", i18n.language) || p.name}
                        </h3>

                        {discount > 0 ? (
                          <p className="mt-2 flex items-baseline gap-2">
                            <span className="text-sm font-semibold text-rose-600">
                              {formatPrice(salePrice(p.basePrice, discount))}
                            </span>
                            <span className="text-xs text-black/35 line-through">
                              {formatPrice(p.basePrice)}
                            </span>
                          </p>
                        ) : (
                          <p className="mt-2 text-sm text-black/60">
                            {formatPrice(p.basePrice)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
        </div>
      </section>

      {/* ================= VALUE PROPS (black + green mix) ================= */}
      <section className="bg-gradient-to-br from-[#111827] via-green-800 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 py-14 sm:py-28">
          <Reveal className="max-w-2xl mb-10 sm:mb-14">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-green-300">
              <span className="w-2 h-2 rounded-full bg-green-300" />
              {t("home.craft_label")}
            </p>
            <h2 className="text-3xl sm:text-5xl font-light leading-tight mt-4">
              {t("home.craft_title")}
            </h2>
            <p className="mt-5 text-white/80 leading-relaxed">
              {t("home.craft_body")}
            </p>
          </Reveal>

          {/* Mobile: one-line horizontal scroll (no orphaned second row).
              md+: a clean 3-up grid. */}
          <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 -mx-6 px-6 md:mx-0 md:px-0">
            {trust.map(({ icon: Icon, label }, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-[46%] sm:w-[30%] md:w-auto rounded-2xl bg-white/10 border border-white/15 p-5 sm:p-6 flex flex-col items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-green-300" />
                </div>
                <span className="text-sm font-medium leading-snug whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>

          <Link
            to="/products"
            className="mt-10 sm:mt-12 inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-green-300 hover:text-white transition"
          >
            {t("home.craft_cta")} <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="relative overflow-hidden bg-[#111827] text-white">
        <div className="absolute -top-24 -end-24 w-96 h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -start-24 w-96 h-96 bg-green-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-3xl mx-auto px-6 py-16 sm:py-28 text-center">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-5xl font-light">
              {t("home.cta_title")}
            </h2>
            <p className="mt-4 text-white/60 max-w-xl mx-auto">
              {t("home.cta_sub")}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-400 hover:text-[#111827] transition-colors"
              >
                {t("home.cta_shop")}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link
                to="/offers"
                className="btn-press inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-white/25 text-sm font-semibold hover:bg-white hover:text-[#111827] transition-colors"
              >
                {t("home.cta_offers")}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}