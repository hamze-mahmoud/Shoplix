import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

export default function Navbar() {
  const navRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/"
          className="text-2xl font-bold text-green-600 tracking-wide"
        >
          Shoplix
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700">

          <Link className="hover:text-green-600 transition" to="/products">
            Products
          </Link>

          <Link className="hover:text-green-600 transition" to="/categories">
            Categories
          </Link>

          <Link className="hover:text-green-600 transition" to="/cart">
            Cart
          </Link>

        </nav>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          <Link
            to="/login"
            className="text-sm hover:text-green-600"
          >
            Login
          </Link>

          <Link
            to="/profile"
            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
          >
            Profile
          </Link>

        </div>
      </div>
    </header>
  );
}