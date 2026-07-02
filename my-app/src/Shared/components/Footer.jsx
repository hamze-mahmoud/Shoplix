import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";

export default function Footer() {
  const footerRef = useRef();

  useEffect(() => {
    gsap.fromTo(
      footerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1 }
    );
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-gradient-to-r from-green-600 to-green-800 text-white mt-10"
    >
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">

        {/* BRAND */}
        <div>
          <h2 className="text-xl font-bold mb-2">Shoplix</h2>
          <p className="text-sm text-gray-200">
            Your modern e-commerce platform for smart shopping.
          </p>
        </div>

        {/* LINKS */}
        <div>
          <h3 className="font-semibold mb-2">Quick Links</h3>
          <ul className="space-y-1 text-sm">

            <li>
              <Link to="/products" className="hover:underline">
                Products
              </Link>
            </li>

            <li>
              <Link to="/categories" className="hover:underline">
                Categories
              </Link>
            </li>

            <li>
              <Link to="/cart" className="hover:underline">
                Cart
              </Link>
            </li>

          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="font-semibold mb-2">Contact</h3>
          <p className="text-sm">support@shoplix.com</p>
          <p className="text-sm">+970 123 456 789</p>
        </div>

      </div>

      <div className="text-center text-sm py-4 border-t border-green-500">
        © {new Date().getFullYear()} Shoplix. All rights reserved.
      </div>
    </footer>
  );
}