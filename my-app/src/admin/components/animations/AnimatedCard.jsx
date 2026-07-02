import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function AnimatedCard({ title, value }) {
  const cardRef = useRef();

  useEffect(() => {
    gsap.from(cardRef.current, { opacity: 0, scale: 0.9, duration: 0.6, ease: "back.out(1.7)", delay: 0.1 });
  }, []);

  return (
    <div ref={cardRef} className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );
}