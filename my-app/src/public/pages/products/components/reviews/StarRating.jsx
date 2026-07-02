import { useRef, useState } from "react";
import { Star } from "lucide-react";
import gsap from "gsap";

const SIZES = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
};

/**
 * StarRating — dual mode:
 *  - read-only display: supports fractional values (e.g. 4.3) via a clipped overlay
 *  - interactive input: click to set, hover to preview, GSAP pop on selection
 */
export default function StarRating({
  value = 0,
  onChange = null,
  size = "md",
  className = "",
}) {
  const [hovered, setHovered] = useState(null);
  const starRefs = useRef([]);
  const interactive = !!onChange;

  const displayValue = hovered ?? value;
  const sizeClass = SIZES[size] || SIZES.md;

  const handleClick = (star) => {
    onChange(star);
    const el = starRefs.current[star - 1];
    if (el) {
      gsap.fromTo(
        el,
        { scale: 1.5 },
        { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.45)" }
      );
    }
  };

  if (!interactive) {
    const pct = Math.max(0, Math.min(5, displayValue)) / 5 * 100;
    return (
      <div className={`relative inline-flex ${className}`} aria-label={`${displayValue} out of 5 stars`}>
        <div className="flex gap-0.5 text-[#111827]/15">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`${sizeClass} fill-current`} />
          ))}
        </div>
        <div
          className="absolute inset-0 flex gap-0.5 overflow-hidden text-yellow-400"
          style={{ width: `${pct}%` }}
        >
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`${sizeClass} fill-current shrink-0`} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex gap-1 ${className}`}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          ref={(el) => (starRefs.current[star - 1] = el)}
          onMouseEnter={() => setHovered(star)}
          onClick={() => handleClick(star)}
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClass} transition-colors ${
              star <= displayValue
                ? "text-yellow-400 fill-yellow-400"
                : "text-[#111827]/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
