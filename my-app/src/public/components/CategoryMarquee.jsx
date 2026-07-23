import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Boxes } from "lucide-react";
import { localized } from "../../Shared/utils/localize";
import { onImgError } from "../../Shared/utils/imageFallback";

// Minimum total (duplicated) cards to render, so the track is guaranteed wider
// than any realistic viewport — a store with only 1-3 categories would
// otherwise render a track narrower than the screen, which doesn't overflow
// and so just sits flush to one side with a dead gap instead of looping.
const MIN_LOOP_CARDS = 12;

// Auto-scrolling category banner: a slow, infinite marquee of category cards.
// The list is repeated enough times to comfortably exceed the viewport width
// (see MIN_LOOP_CARDS above), then the CSS animation shifts the track by
// EXACTLY one repeat-unit's rendered width (a generalized version of the
// classic "duplicate + translateX(-50%)" loop trick that works for any repeat
// count — see --marquee-repeat / marquee-x in index.css) so it loops
// seamlessly regardless of how many categories the store has. The scroll
// direction mirrors per language: it moves opposite to the reading direction
// (right-to-left in LTR, left-to-right in RTL) — the standard ticker
// convention, kept consistent across languages. Hovering pauses it;
// reduced-motion users get a static row.
export default function CategoryMarquee({ categories = [], loading = false }) {
  const { t, i18n } = useTranslation();

  if (loading) {
    return (
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="shrink-0 w-52 sm:w-60 h-36 sm:h-40 rounded-2xl bg-black/[0.06] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!categories.length) return null;

  const duration = Math.max(30, categories.length * 5); // ~5s per card, min 30s
  const isRTL = i18n.dir?.() === "rtl";
  const repeat = Math.max(2, Math.ceil(MIN_LOOP_CARDS / categories.length));
  const loop = Array.from({ length: repeat }, () => categories).flat();

  const Card = ({ cat, ghost }) => {
    const img = cat.image?.url;
    return (
      <Link
        to={`/categories/${cat._id}`}
        aria-hidden={ghost}
        tabIndex={ghost ? -1 : 0}
        className="group relative shrink-0 w-52 sm:w-60 h-36 sm:h-40 rounded-2xl overflow-hidden border border-black/[0.07] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-2 hover:ring-green-500/70"
      >
        {img ? (
          <img
            src={img}
            alt={cat.name}
            loading="lazy"
            onError={onImgError}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#111827] to-green-700">
            {cat.icon ? (
              <span className="text-4xl drop-shadow">{cat.icon}</span>
            ) : (
              <Boxes className="w-9 h-9 text-white/85" />
            )}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* hover explore badge */}
        <span className="absolute top-2.5 end-2.5 w-8 h-8 rounded-full bg-white text-[#111827] flex items-center justify-center shadow-md opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <ArrowUpRight className="w-4 h-4 rtl:-scale-x-100" />
        </span>

        {/* sub-category tag */}
        {cat.isRoot === false && (
          <span className="absolute top-2.5 start-2.5 text-[9px] uppercase tracking-[0.15em] font-semibold text-white/90 bg-green-600/90 px-2 py-0.5 rounded-full">
            {t("home.subcategory_tag")}
          </span>
        )}

        <h3 className="absolute bottom-3 inset-x-3 text-white font-semibold text-sm sm:text-[15px] line-clamp-1 drop-shadow">
          {localized(cat, "name", i18n.language)}
        </h3>
      </Link>
    );
  };

  return (
    // Edge fade so cards dissolve at the banner's left/right instead of cutting.
    <div
      className="relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, #000 5%, #000 95%, transparent)",
      }}
    >
      <div
        className="marquee-track py-2"
        style={{
          "--marquee-duration": `${duration}s`,
          "--marquee-repeat": repeat,
          "--marquee-dir": isRTL ? 1 : -1,
        }}
      >
        {loop.map((cat, i) => (
          <Card key={`${cat._id}-${i}`} cat={cat} ghost={i >= categories.length} />
        ))}
      </div>
    </div>
  );
}
