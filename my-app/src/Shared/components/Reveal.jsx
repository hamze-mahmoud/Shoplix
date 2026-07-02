import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveal — animates its children in once they scroll into view.
 * Restrained, premium motion (fade + subtle rise). Respects reduced-motion.
 *
 * Props: as (tag), y, x, delay, duration, className
 */
export default function Reveal({
  children,
  as: Tag = "div",
  y = 36,
  x = 0,
  delay = 0,
  duration = 0.9,
  className = "",
  start = "top 86%",
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(el, { opacity: 1, x: 0, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y, x },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start, once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [y, x, delay, duration, start]);

  return (
    <Tag ref={ref} className={className} style={{ opacity: 0 }}>
      {children}
    </Tag>
  );
}
