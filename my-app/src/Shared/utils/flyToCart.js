import gsap from "gsap";

// "Fly to cart" — clones a product image and arcs it into the navbar cart
// icon, shrinking as it goes, then gives the cart a little receive-bump.
// Purely cosmetic: never throws, silently no-ops if anything is missing or
// the user prefers reduced motion. The +1 badge pop is handled separately by
// the Navbar's cartCount effect (fires when the real count updates).
//
// Usage: flyToCart({ imageUrl, source })  where `source` is the element the
// image should fly FROM (the gallery image or the add-to-cart button).

const CART_TARGET_ID = "nav-cart-icon";

function reducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

// Quadratic bezier point at t (0..1) for control-point arc.
function bezier(t, p0, p1, p2) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

export function flyToCart({ imageUrl, source } = {}) {
  try {
    if (!imageUrl || reducedMotion()) return;

    const srcRect = source?.getBoundingClientRect?.();
    const target = document.getElementById(CART_TARGET_ID);
    const tgtRect = target?.getBoundingClientRect?.();
    if (!srcRect || !tgtRect || srcRect.width === 0) return;

    // Start = centre of the source; End = centre of the cart icon.
    const start = {
      x: srcRect.left + srcRect.width / 2,
      y: srcRect.top + srcRect.height / 2,
    };
    const end = {
      x: tgtRect.left + tgtRect.width / 2,
      y: tgtRect.top + tgtRect.height / 2,
    };
    // Control point above the pair → graceful upward arc toward the cart.
    const control = {
      x: (start.x + end.x) / 2,
      y: Math.min(start.y, end.y) - 140,
    };

    // Flyer: a fixed clone, capped size, centred on the start point.
    const size = Math.min(srcRect.width, srcRect.height, 150);
    const flyer = document.createElement("img");
    flyer.src = imageUrl;
    Object.assign(flyer.style, {
      position: "fixed",
      left: "0",
      top: "0",
      width: `${size}px`,
      height: `${size}px`,
      objectFit: "cover",
      borderRadius: "18px",
      boxShadow: "0 12px 32px rgba(0,0,0,0.28)",
      pointerEvents: "none",
      zIndex: "9999",
      willChange: "transform, opacity",
    });
    document.body.appendChild(flyer);

    const place = (pt, scale, rot) => {
      flyer.style.transform = `translate(${pt.x - size / 2}px, ${
        pt.y - size / 2
      }px) scale(${scale}) rotate(${rot}deg)`;
    };
    place(start, 1, 0);

    const proxy = { t: 0 };
    gsap.to(proxy, {
      t: 1,
      duration: 0.8,
      ease: "power1.inOut",
      onUpdate: () => {
        const pt = bezier(proxy.t, start, control, end);
        const scale = 1 - 0.86 * proxy.t; // 1 → ~0.14
        const rot = 40 * proxy.t;
        flyer.style.opacity = proxy.t > 0.85 ? String(1 - (proxy.t - 0.85) / 0.15 * 0.6) : "1";
        place(pt, scale, rot);
      },
      onComplete: () => {
        flyer.remove();
        // Receive-bump on the cart icon for the "caught it" beat.
        if (target) {
          gsap.fromTo(
            target,
            { scale: 1 },
            { scale: 1.35, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out", clearProps: "transform" }
          );
        }
      },
    });
  } catch {
    // Cosmetic only — never let a fly animation break add-to-cart.
  }
}
