import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Premium hero slider — crossfading editorial slides with auto-advance,
 * dot indicators and arrow controls. Pauses on hover. RTL-aware.
 *
 * slides: [{ img, kicker, title, title2, sub, cta, to }]
 */
export default function HeroSlider({ slides = [], interval = 6000 }) {
  const [active, setActive] = useState(0);
  const timer = useRef(null);
  const count = slides.length;

  const go = useCallback((i) => setActive((i + count) % count), [count]);
  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);

  // Auto-advance
  useEffect(() => {
    if (count <= 1) return;
    timer.current = setInterval(next, interval);
    return () => clearInterval(timer.current);
  }, [next, interval, count]);

  const pause = () => clearInterval(timer.current);
  const resume = () => {
    if (count > 1) timer.current = setInterval(next, interval);
  };

  if (!count) return null;

  return (
    <section
      className="relative min-h-[88vh] overflow-hidden bg-[#111827]"
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div className="absolute -bottom-32 -start-32 w-[28rem] h-[28rem] bg-green-500/15 rounded-full blur-3xl pointer-events-none z-[1]" />

      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* absolute so the caption below overlays the image instead of
              flowing underneath it (which pushed the text out of view) */}
          <img src={s.img} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#111827]/85 via-[#111827]/45 to-transparent" />
          {/* Mobile-only even darkening: on desktop the text sits in the left
              half, so the directional gradient above is enough contrast. On
              mobile the text is centered across the FULL width (below), so it
              needs even contrast against whatever part of the photo is behind
              it, not just the left edge. */}
          <div className="absolute inset-0 bg-black/30 sm:hidden" />

          <div className="relative z-10 h-full min-h-[88vh] flex items-center">
            <div className="max-w-7xl mx-auto px-6 sm:px-10 w-full">
              <div
                className={`max-w-2xl mx-auto sm:mx-0 text-center sm:text-start text-white transition-all duration-700 ${
                  i === active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                {s.kicker && (
                  <p className="text-[11px] sm:text-xs uppercase tracking-luxe text-white/70 mb-6">{s.kicker}</p>
                )}
                <h1 className="font-display font-light leading-[0.95] text-5xl sm:text-7xl lg:text-8xl">
                  {s.title}
                  {s.title2 && <span className="block italic text-[#FACC15]/90">{s.title2}</span>}
                </h1>
                {s.sub && (
                  <p className="mt-7 text-base sm:text-lg text-white/80 max-w-md mx-auto sm:mx-0 leading-relaxed font-light">{s.sub}</p>
                )}
                <div className="mt-10 flex justify-center sm:justify-start">
                  <Link
                    to={s.to || "/products"}
                    className="btn-press group inline-flex items-center gap-3 bg-white text-[#111827] px-8 py-4 text-sm uppercase tracking-[0.15em] font-medium hover:bg-yellow-400 transition-colors"
                  >
                    {s.cta}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      {count > 1 && (
        <>
          <button
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
            className="absolute start-4 sm:start-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#111827] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <button
            onClick={() => go(active + 1)}
            aria-label="Next slide"
            className="absolute end-4 sm:end-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/30 text-white flex items-center justify-center hover:bg-white hover:text-[#111827] transition-colors"
          >
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center gap-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === active ? "w-8 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
