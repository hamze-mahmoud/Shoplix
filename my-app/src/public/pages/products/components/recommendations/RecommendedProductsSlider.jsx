import { useRef } from "react";
import gsap from "gsap";
import RecommendedProductCard from "./RecommendedProductCard";

export default function RecommendedProductsSlider({
  products,
}) {
  const containerRef = useRef();

  const scroll = (dir) => {
    gsap.to(containerRef.current, {
      x:
        dir === "left"
          ? "+=200"
          : "-=200",
      duration: 0.5,
      ease: "power2.out",
    });
  };

  return (
    <div className="relative">
      {/* Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 z-10 bg-white shadow p-2 rounded-full"
      >
        ◀
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 z-10 bg-white shadow p-2 rounded-full"
      >
        ▶
      </button>

      {/* Slider */}
      <div className="overflow-hidden">
        <div
          ref={containerRef}
          className="flex gap-4 transition"
        >
          {products.map((p) => (
            <RecommendedProductCard
              key={p._id}
              product={p}
            />
          ))}
        </div>
      </div>
    </div>
  );
}