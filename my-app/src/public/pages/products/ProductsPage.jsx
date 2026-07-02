import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX, Star, ArrowUpRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import ProductFilters from "./components/listing/ProductFilters";

import { productService } from "../../../Shared/services/productService";
import { categoryService } from "../../../Shared/services/categoryService";
import { localized } from "../../../Shared/utils/localize";
import { onImgError } from "../../../Shared/utils/imageFallback";
import { formatPrice } from "../../../Shared/utils/formPrice";
import { discountOf, salePrice } from "../../../Shared/utils/pricing";
import SaleBadge from "../../../Shared/components/SaleBadge";

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

/* 2027 glassmorphism product card */
function ProductCard2027({ product, t, lang }) {
  const variants = product.variants || [];
  const img = variants?.[0]?.images?.[0];

  const prices = variants.map((v) => v.price || 0).filter(Boolean);
  const min = prices.length ? Math.min(...prices) : product.basePrice;
  const max = prices.length ? Math.max(...prices) : product.basePrice;
  const stock = variants.reduce((s, v) => s + (v.stock || 0), 0);

  const rating = product.ratingAvg || 0;
  const reviews = product.ratingCount || 0;

  const discount = discountOf(product);
  const fmtRange = (mn, mx) => (mn === mx ? formatPrice(mn) : `${formatPrice(mn)} – ${formatPrice(mx)}`);
  const baseMin = prices.length ? min : product.basePrice;
  const baseMax = prices.length ? max : product.basePrice;
  const priceLabel = fmtRange(baseMin, baseMax);
  const saleLabel = fmtRange(salePrice(baseMin, discount), salePrice(baseMax, discount));

  return (
    <Link to={`/products/${product._id}`} data-pcard className="group block">
      {/* MEDIA */}
      <div className="relative aspect-[4/5] rounded-[26px] overflow-hidden bg-gray-100 ring-1 ring-black/[0.06] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_30px_60px_-22px_rgba(16,163,74,0.45)] group-hover:ring-2 group-hover:ring-green-500/60">
        {img ? (
          <img
            src={img}
            alt={product.name}
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

        {/* top-start badges: SALE + rating */}
        <div className="absolute top-3 start-3 flex flex-col items-start gap-1.5">
          {discount > 0 && <SaleBadge percent={discount} />}
          {reviews > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/35 backdrop-blur-md border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-white">
              <Star className="w-3 h-3 text-green-400" fill="currentColor" strokeWidth={0} />
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>

        {/* sold-out badge */}
        {stock === 0 && (
          <span className="absolute top-3 end-3 bg-[#111827] text-white text-[10px] uppercase tracking-[0.16em] font-semibold px-2.5 py-1 rounded-full">
            {t("products.sold_out")}
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
          {localized(product.category, "name", lang) || t("products.uncategorized")}
        </p>
        <h3 className="font-display text-xl mt-1 leading-snug group-hover:text-[#16A34A] transition-colors line-clamp-1">
          {localized(product, "name", lang)}
        </h3>

        <div className="mt-2">
          <Stars value={rating} count={reviews} t={t} />
        </div>

        {discount > 0 ? (
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-[15px] font-bold text-rose-600">{saleLabel}</span>
            <span className="text-xs text-[#111827]/40 line-through">{priceLabel}</span>
          </p>
        ) : (
          <p className="mt-2 text-[15px] font-semibold text-[#111827]">{priceLabel}</p>
        )}
      </div>
    </Link>
  );
}

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const gridRef = useRef(null);

  const selectedCategory = useMemo(
    () => categories.find((item) => item._id === category),
    [categories, category]
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await categoryService.getAllCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await productService.getAllProducts({ category, sort });
        setProducts(res.data.products || []);
      } catch (err) {
        setError("Failed to load products");
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [category, sort]);

  // GSAP staggered grid reveal — robust to reduced-motion / hidden tab
  useEffect(() => {
    if (loading || !products.length || !gridRef.current) return;
    const cards = gridRef.current.querySelectorAll("[data-pcard]");
    if (prefersReducedMotion() || document.hidden) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 85%", once: true },
        }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [loading, products]);

  const resetFilters = () => {
    setCategory("");
    setSort("newest");
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">
      {/* HERO with green/black accent */}
      <section className="relative overflow-hidden border-b border-black/[0.06]">
        <div className="absolute -top-32 -end-24 w-[26rem] h-[26rem] bg-green-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 start-0 w-1.5 h-full bg-gradient-to-b from-[#16A34A] to-[#111827]" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-10 py-10 sm:py-20">
          <p className="inline-flex items-center gap-2.5 text-xs uppercase tracking-[0.28em] text-[#16A34A] font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
            {t("products.browse")}
          </p>
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-3">
            <h1 className="font-display font-light text-4xl sm:text-7xl lg:text-8xl leading-[0.95] sm:leading-[0.9] tracking-tight">
              {selectedCategory ? localized(selectedCategory, "name", i18n.language) : t("nav.products")}
            </h1>
            <p className="text-xs uppercase tracking-[0.18em] text-[#111827]/50">
              {t("products.count", { count: products.length })}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-8 sm:py-14">
        {/* FILTER BAR */}
        <ProductFilters
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          categories={categories}
        />

        {/* ERROR */}
        {error && (
          <div className="mt-10 border border-red-200 bg-red-50/60 text-red-700 p-5 rounded-2xl flex items-start gap-3">
            <SearchX className="w-5 h-5 mt-0.5" />
            <div>
              <h2 className="font-semibold">{t("products.load_error")}</h2>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* GRID / STATES */}
        {loading ? (
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#F1F3F5] rounded-[26px] mb-4" />
                <div className="h-3 w-1/3 bg-[#F1F3F5] mb-2 rounded" />
                <div className="h-4 w-3/4 bg-[#F1F3F5] mb-2 rounded" />
                <div className="h-3 w-1/4 bg-[#F1F3F5] rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] text-white flex items-center justify-center mb-6">
              <SearchX className="w-7 h-7" />
            </div>
            <h2 className="font-display text-3xl">{t("products.no_products")}</h2>
            <p className="mt-3 text-[#111827]/55 max-w-sm">{t("products.no_products_desc")}</p>
            <button
              onClick={resetFilters}
              className="mt-8 text-xs uppercase tracking-[0.18em] border-b border-[#111827] pb-1 hover:text-[#16A34A] hover:border-[#16A34A] transition-colors"
            >
              {t("products.reset_filters")}
            </button>
          </div>
        ) : (
          <div ref={gridRef} className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p) => (
              <ProductCard2027 key={p._id} product={p} t={t} lang={i18n.language} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
