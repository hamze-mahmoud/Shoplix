import { useState, useRef, useCallback } from "react";
import { ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { onImgError } from "../../../../../Shared/utils/imageFallback";

export default function ProductGallery({ product }) {
  const { t } = useTranslation();
  const variants = product.variants || [];

  const [variantIdx, setVariantIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const mainRef = useRef();
  const activeVariant = variants[variantIdx];
  const images = activeVariant?.images || [];
  const currentImage = images[imageIdx] || activeVariant?.images?.[0];

  const switchVariant = (i) => {
    setVariantIdx(i);
    setImageIdx(0);
    gsap.fromTo(mainRef.current,
      { opacity: 0.6, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
    );
  };

  const switchImage = (i) => {
    setImageIdx(i);
    gsap.fromTo(mainRef.current,
      { opacity: 0.5, x: i > imageIdx ? 10 : -10 },
      { opacity: 1, x: 0, duration: 0.25, ease: "power2.out" }
    );
  };

  const prevImage = () => switchImage((imageIdx - 1 + images.length) % images.length);
  const nextImage = () => switchImage((imageIdx + 1) % images.length);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, []);

  return (
    <div className="space-y-4">

      {/* MAIN IMAGE — click to toggle zoom, then move to pan */}
      <div
        className={`relative overflow-hidden rounded-[24px] bg-[#F8F9FA] border border-[#111827]/8 select-none ${
          zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        onClick={() => setZoomed((z) => !z)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={zoomed ? handleMouseMove : undefined}
      >
        <div
          ref={mainRef}
          className="w-full h-[360px] sm:h-[420px] overflow-hidden"
        >
          <img
            src={currentImage}
            alt={product.name}
            loading="eager"
            onError={onImgError}
            className="w-full h-full object-contain p-6 transition-transform duration-200"
            style={zoomed ? {
              transform: "scale(2)",
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
            } : {}}
          />
        </div>

        {/* Zoom hint badge */}
        {!zoomed && (
          <div className="absolute bottom-3 end-3 flex items-center gap-1.5 bg-[#111827] text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none">
            <ZoomIn className="w-3 h-3" />
            {t("products.zoom_hint")}
          </div>
        )}

        {/* Prev / Next arrows (only when multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute start-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-green-500 shadow-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-green-500 shadow-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* THUMBNAILS — per image within active variant */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => switchImage(i)}
              className={`shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === imageIdx
                  ? "border-green-500 shadow-md scale-105"
                  : "border-[#111827]/10 hover:border-yellow-400 opacity-70 hover:opacity-100"
              }`}
            >
              <img src={img} className="w-full h-full object-cover" loading="lazy" alt="" />
            </button>
          ))}
        </div>
      )}

      {/* VARIANT COLOUR SWATCHES */}
      {variants.length > 1 && (
        <div className="flex gap-2 flex-wrap pt-1">
          {variants.map((v, i) => (
            <button
              key={i}
              onClick={() => switchVariant(i)}
              title={v.color}
              className={`w-9 h-9 rounded-full border-2 transition-all duration-200 overflow-hidden ${
                i === variantIdx
                  ? "border-green-500 scale-110 shadow-md ring-2 ring-yellow-400/50"
                  : "border-[#111827]/10 hover:border-yellow-400"
              }`}
            >
              {v.images?.[0] ? (
                <img src={v.images[0]} className="w-full h-full object-cover" loading="lazy" alt={v.color} />
              ) : (
                <span className="w-full h-full block bg-[#111827]/10" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
