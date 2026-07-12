import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, Flame } from "lucide-react";

// Live ticking countdown for limited-time offers — a proven urgency driver.
//
//   <Countdown until={offer.endDate} mode="chip"  variant="dark" />   card overlay
//   <Countdown until={offer.endDate} mode="boxes" />                  details page
//
// • ticks every second (tabular-nums so digits don't jitter)
// • URGENT state when < 24h left: switches to a hot rose/flame style
// • ended → compact "offer ended" chip (public API hides expired offers on
//   the next fetch; this covers a session that crosses the boundary)
// • RTL-safe: uses logical flow only; digits stay latin like prices

const pad = (n) => String(n).padStart(2, "0");

function remaining(until) {
  const ms = new Date(until).getTime() - Date.now();
  if (!until || isNaN(ms) || ms <= 0) return null;
  return {
    ms,
    d: Math.floor(ms / 86400000),
    h: Math.floor((ms % 86400000) / 3600000),
    m: Math.floor((ms % 3600000) / 60000),
    s: Math.floor((ms % 60000) / 1000),
  };
}

export default function Countdown({ until, mode = "chip", variant = "light", className = "" }) {
  const { t } = useTranslation();
  const [left, setLeft] = useState(() => remaining(until));

  useEffect(() => {
    setLeft(remaining(until));
    const id = setInterval(() => setLeft(remaining(until)), 1000);
    return () => clearInterval(id);
  }, [until]);

  if (!until) return null;

  // ----- ended -----
  if (!left) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-gray-200 text-gray-500 ${className}`}
      >
        <Clock className="w-3 h-3" />
        {t("offers.ended", "Offer ended")}
      </span>
    );
  }

  const urgent = left.ms < 24 * 3600000; // last day → heat up
  const Icon = urgent ? Flame : Clock;

  // ----- compact chip (cards) -----
  if (mode === "chip") {
    const palette =
      variant === "dark"
        ? urgent
          ? "bg-rose-500/90 text-white border-rose-300/40"
          : "bg-black/45 text-white border-white/20"
        : urgent
        ? "bg-rose-600 text-white border-rose-400/40"
        : "bg-white/90 text-[#111827] border-black/10";

    return (
      <span
        dir="ltr"
        className={`inline-flex items-center gap-1.5 backdrop-blur-md border text-[11px] font-bold px-2.5 py-1.5 rounded-full shadow-md tabular-nums ${palette} ${className}`}
      >
        <Icon className={`w-3.5 h-3.5 ${urgent ? "animate-pulse" : ""}`} />
        {left.d > 0 && (
          <span>
            {left.d}
            {t("offers.time_d", "d")}
          </span>
        )}
        <span>
          {pad(left.h)}:{pad(left.m)}:{pad(left.s)}
        </span>
      </span>
    );
  }

  // ----- segmented boxes (details page) -----
  const cells = [
    { v: left.d, l: t("offers.time_days", "days") },
    { v: left.h, l: t("offers.time_hours", "hours") },
    { v: left.m, l: t("offers.time_mins", "min") },
    { v: left.s, l: t("offers.time_secs", "sec") },
  ];

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide ${
          urgent ? "text-rose-600" : "text-[#111827]/60"
        }`}
      >
        <Icon className={`w-4 h-4 ${urgent ? "animate-pulse" : ""}`} />
        {urgent ? t("offers.ends_soon", "Ends soon!") : t("offers.ends_in", "Ends in")}
      </span>
      <div dir="ltr" className="flex items-center gap-1.5">
        {cells.map((c, i) => (
          <div
            key={i}
            className={`min-w-[52px] text-center rounded-xl px-2 py-1.5 tabular-nums ${
              urgent ? "bg-rose-600 text-white" : "bg-[#111827] text-white"
            }`}
          >
            <div className="text-lg font-bold leading-none">{pad(c.v)}</div>
            <div className={`text-[9px] uppercase tracking-wider mt-0.5 ${urgent ? "text-rose-200" : "text-white/50"}`}>
              {c.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
