import { useRef, useEffect } from "react";
import { gsap } from "gsap";

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
}) {
  const ref = useRef();



  const styles = {
    primary: "bg-blue-500 text-black hover:bg-blue-600",
    danger: "bg-red-500 text-black hover:bg-red-600",
    outline: "border border-gray-300 text-black hover:bg-gray-100",
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`px-4 py-2 rounded transition ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}