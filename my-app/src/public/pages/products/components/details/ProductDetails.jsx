import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { productService } from "../../../../../Shared/services/productService";

import ProductGallery from "./ProductGallery";
import ProductInfo from "./ProductInfo";
import ProductVariants from "../ProductVariants";
import AddToCartSection from "./AddToCartSection";
import RecommendedProducts from "../recommendations/RecommendedProducts";
import ReviewsSection from "../reviews/ReviewsSection";

function Skeleton() {
  return (
    <div className="grid lg:grid-cols-2 gap-12 animate-pulse">
      <div className="aspect-square bg-[#E5E7EB]" />
      <div className="space-y-4 pt-4">
        <div className="h-3 w-1/4 bg-[#E5E7EB]" />
        <div className="h-12 w-3/4 bg-[#E5E7EB]" />
        <div className="h-6 w-1/3 bg-[#E5E7EB]" />
        <div className="h-3 w-full bg-[#E5E7EB]" />
        <div className="h-3 w-2/3 bg-[#E5E7EB]" />
        <div className="h-12 w-full bg-[#E5E7EB] mt-6" />
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState(null);
  const [reviewSummary, setReviewSummary] = useState(null);

  useEffect(() => {
    setProduct(null);
    setError(null);
    setReviewSummary(null);
    window.scrollTo(0, 0);
    productService
      .getProductById(id)
      .then((res) => setProduct(res.data))
      .catch(() => setError("Failed to load product"));
  }, [id]);

  return (
    <div className="bg-[#F8F9FA] text-[#111827] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-10 py-6 sm:py-14">

        {/* BREADCRUMB */}
        <nav className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#111827]/50 mb-6 sm:mb-10">
          <Link to="/" className="hover:text-[#111827] transition-colors">{t("nav.home")}</Link>
          <ChevronRight className="w-3 h-3 shrink-0 rtl:rotate-180" />
          <Link to="/products" className="hover:text-[#111827] transition-colors">{t("nav.products")}</Link>
          {product && (
            <>
              <ChevronRight className="w-3 h-3 shrink-0 rtl:rotate-180" />
              <span className="text-[#111827] line-clamp-1">{product.name}</span>
            </>
          )}
        </nav>

        {error ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5">
            <p className="font-display text-3xl">{error}</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] border-b border-[#111827] pb-1 hover:text-[#16A34A] hover:border-[#16A34A] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
              {t("nav.products")}
            </Link>
          </div>
        ) : !product ? (
          <Skeleton />
        ) : (
          <>
            <div className="bg-white rounded-[20px] sm:rounded-[32px] border border-[#111827]/8 shadow-[0_2px_40px_-12px_rgba(17,24,39,0.12)] p-4 sm:p-10">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* GALLERY */}
                <ProductGallery product={product} />

                {/* INFO — flat editorial column, sticky on desktop */}
                <div className="lg:sticky lg:top-24 space-y-6 sm:space-y-8">
                  <ProductInfo product={product} reviewSummary={reviewSummary} />

                  <div className="border-t border-[#111827]/10 pt-6 sm:pt-8">
                    <ProductVariants product={product} setSelectedV={setSelectedVariant} />
                  </div>

                  <div className="border-t border-[#111827]/10 pt-6 sm:pt-8">
                    <AddToCartSection product={product} variant={selectedVariant} />
                  </div>
                </div>
              </div>
            </div>

            {/* RECOMMENDED */}
            <div className="mt-12 sm:mt-28 border-t border-[#111827]/10 pt-10 sm:pt-16">
              <RecommendedProducts productId={product._id} />
            </div>

            {/* REVIEWS */}
            <div id="reviews">
              <ReviewsSection productId={product._id} onSummaryChange={setReviewSummary} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
