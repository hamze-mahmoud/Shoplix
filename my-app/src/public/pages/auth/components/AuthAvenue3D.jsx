import { Component, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Image as DreiImage } from "@react-three/drei";
import { gsap } from "gsap";
import { productService } from "../../../../Shared/services/productService";

// "Product avenue" backdrop for the auth pages: two columns of product-image
// billboards flanking a central road (where the form sits), angled inward and
// receding toward a vanishing point — like the buildings in a night street.
// The whole avenue continuously drifts toward the camera (endless street),
// with a GSAP fly-in entrance. Lazy-loaded (three.js out of the auth chunk).

const FALLBACK = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
];

// --- avenue geometry (tweak to taste) ---
const PER_SIDE = 6; // billboards per side
const COLUMN_X = 3.6; // how far each column sits from the center road
const PANEL_W = 2.4;
const PANEL_H = 3.2;
const TILT = 0.42; // inward angle (radians)
const NEAR_Z = 6.5; // past this the billboard loops to the back
const FAR_Z = -22;
const SPEED = 1.25; // world units / second toward the camera
const DEPTH = NEAR_Z - FAR_Z;
const GAP = DEPTH / PER_SIDE;

class PanelBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Billboard({ url, side, startZ, phase, animate }) {
  const ref = useRef();
  const baseY = -0.1;

  useFrame((state, delta) => {
    const m = ref.current;
    if (!m) return;
    if (animate) {
      m.position.z += delta * SPEED;
      if (m.position.z > NEAR_Z) m.position.z -= DEPTH; // loop to the back
      m.position.y = baseY + Math.sin(state.clock.elapsedTime * 0.6 + phase) * 0.12;
    }
  });

  return (
    <group ref={ref} position={[side * COLUMN_X, baseY, startZ]} rotation={[0, -side * TILT, 0]}>
      <DreiImage url={url} scale={[PANEL_W, PANEL_H]} radius={0.12} transparent />
    </group>
  );
}

function Avenue({ images, animate }) {
  const groupRef = useRef();

  // build billboard slots: PER_SIDE panels on each column, spread over depth
  const slots = useMemo(() => {
    const out = [];
    let k = 0;
    for (let i = 0; i < PER_SIDE; i++) {
      const z = NEAR_Z - i * GAP;
      for (const side of [-1, 1]) {
        out.push({ side, z, url: images[k % images.length], phase: k });
        k++;
      }
    }
    return out;
  }, [images]);

  // GSAP fly-in entrance
  useEffect(() => {
    if (animate && groupRef.current) {
      gsap.from(groupRef.current.position, { z: -10, duration: 1.6, ease: "power3.out" });
    }
  }, [animate]);

  return (
    <group ref={groupRef}>
      {slots.map((s, i) => (
        <PanelBoundary key={i}>
          <Suspense fallback={null}>
            <Billboard url={s.url} side={s.side} startZ={s.z} phase={s.phase} animate={animate} />
          </Suspense>
        </PanelBoundary>
      ))}
    </group>
  );
}

export default function AuthAvenue3D() {
  const [images, setImages] = useState(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    let alive = true;
    productService
      .getBestSellers({ limit: 8 })
      .then((res) => {
        const imgs = (res.data || [])
          .map((p) => p.image || p.variants?.[0]?.images?.[0])
          .filter(Boolean);
        if (alive) setImages(imgs.length >= 4 ? imgs : FALLBACK);
      })
      .catch(() => alive && setImages(FALLBACK));
    return () => {
      alive = false;
    };
  }, []);

  if (!images) return null;

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.25, 6], fov: 60 }}
      gl={{ alpha: true, antialias: true }}
    >
      <Avenue images={images} animate={!reduced} />
    </Canvas>
  );
}
