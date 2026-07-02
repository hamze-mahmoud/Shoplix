import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen) {
      gsap.from(modalRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-white p-6 rounded-xl shadow-lg w-[400px]"
      >
        <button onClick={onClose} className="float-right text-gray-500">
          ✕
        </button>

        {children}
      </div>
    </div>
  );
}