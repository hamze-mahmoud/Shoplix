// Eye-catching "SALE -X%" pill. `floating` positions it over a product image
// (top corner); otherwise it's an inline badge.
export default function SaleBadge({ percent, floating = false, className = "" }) {
  if (!percent || percent <= 0) return null;

  const base =
    "inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-600 to-red-500 text-white font-extrabold shadow-md shadow-rose-500/30 ring-1 ring-white/30";

  if (floating) {
    return (
      <span
        className={`absolute top-3 start-3 z-10 px-2.5 py-1 text-[11px] tracking-wide ${base} ${className}`}
      >
        −{percent}%
      </span>
    );
  }

  return (
    <span className={`px-2 py-0.5 text-[11px] ${base} ${className}`}>SALE −{percent}%</span>
  );
}
