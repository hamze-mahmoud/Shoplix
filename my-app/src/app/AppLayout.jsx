import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import Navbar from "../public/layout/Navbar";
import Footer from "../public/layout/Footer";
import { getSocket } from "../Shared/services/socket";

// Auth pages render full-screen with their own branded background — no
// navbar/footer chrome.
const BARE_PATHS = ["/login", "/register", "/verify-email", "/verify-success", "/verify-error"];

export default function AppLayout() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const mainRef = useRef();

  const bare = BARE_PATHS.some((p) => location.pathname.startsWith(p));

  // Open a socket for every visitor (guests included) so the admin
  // dashboard can show live-visitor presence in real time.
  useEffect(() => {
    getSocket();
  }, []);

  // Page transition on route change. clearProps removes the leftover inline
  // transform when the tween ends — a transformed <main> silently breaks
  // position:fixed for every descendant (e.g. ScrollTrigger pinning).
  useEffect(() => {
    if (!mainRef.current) return;
    gsap.fromTo(mainRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out", clearProps: "all" }
    );
  }, [location.pathname]);

  // Keep document direction in sync when language changes
  useEffect(() => {
    const dir = ["ar", "he"].includes(i18n.language) ? "rtl" : "ltr";
    document.documentElement.dir = dir;
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (bare) {
    return (
      <main ref={mainRef} className="min-h-screen">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main ref={mainRef} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
