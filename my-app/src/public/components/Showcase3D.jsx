import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { localized } from "../../Shared/utils/localize";

gsap.registerPlugin(ScrollTrigger);

// 3D product showcase: the store's real product photos floating as cards on
// a ring that revolves as the visitor scrolls through the (pinned) section.
// Lazy-loaded from Home so three.js lives in its own chunk.

// A card whose texture fails to load (404/CORS) should vanish quietly, not
// take the whole canvas down with it.
class CardBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Card({ item, index, total, radius, reduced, onPick }) {
  const bob = useRef();
  const inner = useRef();
  const [hovered, setHovered] = useState(false);

  const angle = (index / total) * Math.PI * 2;
  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  useFrame((state) => {
    if (bob.current && !reduced) {
      bob.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.7 + index * 1.9) * 0.14;
    }
    if (inner.current) {
      const s = THREE.MathUtils.lerp(
        inner.current.scale.x,
        hovered ? 1.12 : 1,
        0.12
      );
      inner.current.scale.setScalar(s);
    }
  });

  return (
    <group position={[x, 0, z]} rotation={[0, angle, 0]}>
      <group ref={bob}>
        <group ref={inner}>
          <DreiImage
            url={item.img}
            scale={[1.7, 2.1]}
            transparent
            side={THREE.DoubleSide}
            onClick={(e) => {
              e.stopPropagation();
              onPick(item.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(true);
              document.body.style.cursor = "pointer";
            }}
            onPointerOut={() => {
              setHovered(false);
              document.body.style.cursor = "auto";
            }}
          />
        </group>
      </group>
    </group>
  );
}

// The ring eases toward the scroll position and keeps a slow idle drift.
// Large jumps (scrollbar yanks, fast flicks) SNAP straight to the target —
// easing through them would spin the whole ring like a slot machine.
const SNAP_THRESHOLD = 0.5; // radians of lag before we stop easing and jump
const ROTATION_SPAN = Math.PI * 1.5; // ring turn across the section's passage

function Ring({ items, progressRef, reduced, onPick }) {
  const group = useRef();
  const idle = useRef(0);
  const radius = items.length <= 6 ? 3.1 : 3.8;

  useFrame((_, delta) => {
    if (!group.current) return;
    if (!reduced) idle.current += delta * 0.06;
    const target = (progressRef.current || 0) * ROTATION_SPAN + idle.current;
    const diff = target - group.current.rotation.y;
    if (reduced || Math.abs(diff) > SNAP_THRESHOLD) {
      group.current.rotation.y = target;
    } else {
      // frame-rate-independent ease (≈0.075/frame at 60fps)
      group.current.rotation.y += diff * Math.min(1, delta * 4.5);
    }
  });

  return (
    <group ref={group}>
      {items.map((item, i) => (
        <CardBoundary key={item.id || i}>
          <Suspense fallback={null}>
            <Card
              item={item}
              index={i}
              total={items.length}
              radius={radius}
              reduced={reduced}
              onPick={onPick}
            />
          </Suspense>
        </CardBoundary>
      ))}
    </group>
  );
}

export default function Showcase3D({ products = [] }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const progressRef = useRef(0);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 767px)").matches;

  // Products → { id, img, name }; drop anything without a usable photo.
  const items = useMemo(
    () =>
      products
        .map((p) => ({
          id: p._id,
          img: p.image || p.variants?.[0]?.images?.[0],
          name: localized(p, "name", i18n.language) || p.name,
        }))
        .filter((p) => p.id && p.img)
        .slice(0, isMobile ? 6 : 10),
    [products, i18n.language, isMobile]
  );

  // NO pinning — pinning stutters against native scroll and "holds" the
  // page, which users feel as interrupted scrolling. Instead the ring's
  // rotation follows the section's free passage through the viewport
  // (progress 0→1 from entering at the bottom to leaving at the top).
  useEffect(() => {
    if (reduced || items.length < 4 || !sectionRef.current) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        // scrub:true = progress tracks the scrollbar instantly; smoothing is
        // done in useFrame, where big jumps can snap instead of replaying
        // the whole turn as a fast spin.
        scrub: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
        },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced, items.length]);

  if (items.length < 4) return null;

  return (
    <section
      ref={sectionRef}
      className="relative h-[92vh] overflow-hidden bg-[#F8F9FA]"
    >
      {/* soft stage backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% 45%, #ffffff 0%, #F8F9FA 70%)",
        }}
      />

      <div className="absolute inset-0">
        <Canvas
          dpr={[1, isMobile ? 1.5 : 1.75]}
          camera={{ position: [0, 0.5, 8.4], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          <Ring
            items={items}
            progressRef={progressRef}
            reduced={reduced}
            onPick={(id) => navigate(`/products/${id}`)}
          />
        </Canvas>
      </div>

      {/* overlay copy (never blocks the canvas) */}
      <div className="pointer-events-none absolute inset-x-0 top-12 sm:top-16 z-10 text-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-black/50">
          {t("home.showcase_kicker")}
        </p>
        <h2 className="font-display text-3xl sm:text-5xl mt-3 text-[#111827]">
          {t("home.showcase_title")}
        </h2>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 text-center px-6">
        <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-black/40">
          {t("home.showcase_hint")}
        </p>
      </div>
    </section>
  );
}
