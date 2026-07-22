import { Canvas } from "@react-three/fiber";
import { Float } from "@react-three/drei";

// Decorative 3D backdrop for the Special Offers section: a field of slow,
// floating low-poly "gems" tinted in the brand greens. Purely ambient — no
// scroll pinning (that stutters against native scroll), pointer-events off.
// Lazy-loaded so three.js stays out of the Home chunk.

// Spread across the section with depth (negative z pushes some back).
const GEMS = [
  { pos: [-5.2, 1.8, -3], scale: 1.1, color: "#16A34A", detail: 0 },
  { pos: [4.8, -1.4, -2], scale: 1.35, color: "#22C55E", detail: 0 },
  { pos: [-3.2, -2.2, -4], scale: 0.8, color: "#4ADE80", detail: 1 },
  { pos: [2.4, 2.4, -5], scale: 1.0, color: "#15803D", detail: 0 },
  { pos: [0.2, 0.4, -6], scale: 1.6, color: "#22C55E", detail: 1 },
  { pos: [-6.4, -0.6, -5], scale: 0.9, color: "#34D399", detail: 0 },
  { pos: [6.2, 1.2, -4], scale: 0.75, color: "#4ADE80", detail: 0 },
  { pos: [-1.4, 2.8, -3], scale: 0.6, color: "#86EFAC", detail: 0 },
];

function Gem({ pos, scale, color, detail }) {
  return (
    <Float speed={1.4} rotationIntensity={1.3} floatIntensity={1.6}>
      <mesh position={pos} scale={scale}>
        <icosahedronGeometry args={[1, detail]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.15}
          metalness={0.65}
          flatShading
        />
      </mesh>
    </Float>
  );
}

export default function OffersBackground3D() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 10], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.55} />
      <pointLight position={[10, 10, 10]} intensity={1.3} color="#4ADE80" />
      <pointLight position={[-10, -6, 4]} intensity={1.1} color="#16A34A" />
      {GEMS.map((g, i) => (
        <Gem key={i} {...g} />
      ))}
    </Canvas>
  );
}
