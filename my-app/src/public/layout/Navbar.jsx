import {
  ShoppingCart,
  User,
  UserRound,
  Menu,
  X,
  ChevronDown,
  Globe,
  Package,
  LogOut,
} from "lucide-react";

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

import { useCart } from "../context/CartContext";
import SearchBar from "../pages/search/components/SearchBar";
import useAuth from "../../Shared/hooks/useAuth";
import NotificationBell from "../../Shared/components/notifications/NotificationBell";
import AddedToCartPopover from "./AddedToCartPopover";
import PromoBar from "./PromoBar";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English" },
  { code: "ar", label: "عر", name: "العربية" },
  { code: "he", label: "עב", name: "עברית" },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [openMenu, setOpenMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidePromo, setHidePromo] = useState(false);

  const headerRef = useRef(null);
  const dotRef = useRef(null);
  const badgeRef = useRef(null);
  const langRef = useRef(null);
  const userRef = useRef(null);
  const mobileRef = useRef(null);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  // Real identity for the signed-in state. The User model has no `name` field —
  // it's firstName/lastName — so we build the display name + initials here (an
  // initial-avatar reads more personal and trustworthy than a generic icon).
  const fullName =
    user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  const firstNameOnly = user?.firstName || (fullName ? fullName.split(/\s+/)[0] : "");
  const initials = fullName
    ? fullName.split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
    navigate("/login");
  };

  const goTo = (path) => {
    setShowUserMenu(false);
    navigate(path);
  };

  const switchLanguage = (code) => {
    i18n.changeLanguage(code);
    setShowLangMenu(false);
  };

  // Scroll condense + shadow; tuck the promo strip away once browsing.
  //
  // BOTH state changes shift the header's own height — `scrolled` swaps the
  // padding (py-4 → py-2.5, ~12px) and toggles the border/shadow; `hidePromo`
  // removes the ~40px promo strip. A shorter header nudges scrollY back down,
  // so a SINGLE threshold immediately flips the state back and oscillates —
  // the border line and shadow flicker on/off and the bar visibly shakes.
  // Each state therefore uses HYSTERESIS: a dead zone (wider than the height
  // it moves) between the "turn on" and "turn off" points, so it flips at most
  // once per crossing and never feeds back. Runs inside requestAnimationFrame
  // so it doesn't fight the browser's own scroll frame.
  useEffect(() => {
    let ticking = false;
    const apply = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((prev) => {
        if (!prev && y > 60) return true;
        if (prev && y < 20) return false;
        return prev;
      });
      setHidePromo((prev) => {
        if (!prev && y > 160) return true;
        if (prev && y < 80) return false;
        return prev;
      });
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // GSAP entrance + gentle logo-dot pulse.
  // Uses fromTo (not from) with an explicit visible end state so React
  // StrictMode's double-invoke can't freeze items at opacity:0.
  // Skipped when the tab is hidden (rAF is paused there, which would otherwise
  // leave items stuck at their hidden start frame until the tab is focused).
  useEffect(() => {
    if (prefersReducedMotion() || document.hidden || !headerRef.current) return;
    const items = headerRef.current.querySelectorAll("[data-nav-item]");
    const entrance = gsap.fromTo(
      items,
      { y: -18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, stagger: 0.07, ease: "power3.out" }
    );
    const pulse = dotRef.current
      ? gsap.to(dotRef.current, {
          scale: 1.35,
          transformOrigin: "center",
          duration: 1.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      : null;
    return () => {
      entrance.kill();
      pulse?.kill();
      // Guarantee the bar is visible after any unmount (incl. StrictMode remount)
      gsap.set(items, { clearProps: "all" });
      if (dotRef.current) gsap.set(dotRef.current, { clearProps: "all" });
    };
  }, []);

  // Cart badge bounce on count change
  useEffect(() => {
    if (!badgeRef.current || prefersReducedMotion()) return;
    gsap.fromTo(
      badgeRef.current,
      { scale: 0.6 },
      { scale: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" }
    );
  }, [cartCount]);

  // Mobile menu staggered reveal
  useEffect(() => {
    if (!openMenu || !mobileRef.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from("[data-mobile-item]", {
        y: 14,
        opacity: 0,
        duration: 0.4,
        stagger: 0.06,
        ease: "power3.out",
        clearProps: "transform,opacity",
      });
    }, mobileRef);
    return () => ctx.revert();
  }, [openMenu]);

  // Close the lang / user menus on outside click + on Escape
  useEffect(() => {
    const onClick = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowLangMenu(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const navLinks = [
    { to: "/products", label: t("nav.products") },
    { to: "/categories", label: t("nav.categories") },
    { to: "/offers", label: t("nav.offers") },
    { to: "/tailored", label: t("nav.tailored") },
    { to: "/about", label: t("nav.about") },
    { to: "/contact", label: t("nav.contact") },
  ];

  const iconBtn =
    "group relative inline-flex items-center justify-center w-10 h-10 rounded-full text-[#111827] hover:bg-green-50 active:scale-90 transition-all duration-200";

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 backdrop-blur-md transition-[background-color,border-color] duration-300 ${
        scrolled ? "bg-white/90 border-b border-black/[0.06]" : "bg-white/70 border-b border-transparent"
      }`}
    >
      {/* dynamic rotating promo strip — offers, countdown, personalized picks */}
      <PromoBar collapsed={hidePromo} />

      {/* Drop shadow as a separate opacity-only layer instead of transitioning
          box-shadow on the header itself. Animating box-shadow forces the
          browser to repaint its blur/spread on every frame of the transition —
          a common source of scroll jank, especially on mobile. Opacity is
          compositor-only (GPU), so this fades in for free. */}
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-full h-px shadow-[0_8px_30px_-12px_rgba(0,0,0,0.18)] transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* subtle green accent hairline when scrolled */}
      <span
        className={`pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent transition-opacity duration-300 ${
          scrolled ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Fixed padding — no longer condenses on scroll. Animating padding
          forces a layout reflow on every threshold crossing (and was the root
          cause of the earlier header-shake bug); a constant height means
          scroll-driven state can never trigger layout work, only paint-free
          compositor changes (opacity/background-color) above. */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 gap-4 py-3">
        {/* LOGO */}
        <Link
          to="/"
          data-nav-item
          className="shrink-0 font-display text-[26px] md:text-[32px] leading-none tracking-tight text-[#111827] hover:text-[#16A34A] transition-colors duration-300"
        >
          Shoplix
          <span ref={dotRef} className="inline-block text-[#16A34A]">.</span>
        </Link>

        {/* NAV LINKS (desktop) */}
        <nav className="hidden lg:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} data-nav-item className="group relative py-1">
              {({ isActive }) => (
                <>
                  <span
                    className={`whitespace-nowrap text-[13px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${
                      isActive ? "text-[#16A34A]" : "text-[#111827]/70 group-hover:text-[#111827]"
                    }`}
                  >
                    {link.label}
                  </span>
                  {/* animated green underline */}
                  <span
                    className={`absolute -bottom-0.5 inset-x-0 h-0.5 rounded-full bg-[#16A34A] origin-left transition-transform duration-300 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* SEARCH (desktop) */}
        <div data-nav-item className="hidden lg:flex flex-1 max-w-sm mx-2">
          <SearchBar />
        </div>

        {/* ACTIONS */}
        <div data-nav-item className="flex items-center gap-1 sm:gap-1.5">
          {/* Mobile hamburger */}
          <button
            className={`lg:hidden ${iconBtn}`}
            onClick={() => setOpenMenu(!openMenu)}
            aria-label="Menu"
          >
            {openMenu ? (
              <X className="w-5 h-5 text-[#111827] group-hover:text-green-600 transition-colors" />
            ) : (
              <Menu className="w-5 h-5 text-[#111827] group-hover:text-green-600 transition-colors" />
            )}
          </button>

          {/* Language switcher */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => { setShowLangMenu((o) => !o); setShowUserMenu(false); }}
              aria-haspopup="menu"
              aria-expanded={showLangMenu}
              className="group flex items-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-full hover:bg-green-50 active:scale-95 transition-all duration-200 text-sm font-semibold text-[#111827]"
              aria-label="Change language"
            >
              <Globe className="w-5 h-5 group-hover:text-green-600 transition-colors" />
              <span className="hidden sm:inline">{currentLang.label}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 opacity-50 transition-transform duration-300 ${
                  showLangMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showLangMenu && (
              <div className="absolute end-0 mt-2 w-44 bg-white border border-black/[0.06] rounded-2xl shadow-xl py-1.5 z-50 animate-slide-down">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLanguage(lang.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition text-start ${
                      lang.code === i18n.language
                        ? "text-[#16A34A] font-semibold bg-green-50"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="font-bold w-6 text-center shrink-0">{lang.label}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="hidden sm:block w-px h-6 bg-black/10 mx-1" />

          {/* NOTIFICATIONS + CART */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {isAuthenticated && <NotificationBell />}

            <div className="relative">
              <Link to="/cart" className={iconBtn} aria-label={t("nav.cart")}>
                <ShoppingCart id="nav-cart-icon" className="w-5 h-5 text-[#111827] group-hover:text-green-600 transition-colors" />
                {cartCount > 0 && (
                  <span
                    ref={badgeRef}
                    className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-[#16A34A] rounded-full ring-2 ring-white shadow-sm"
                  >
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>
              <AddedToCartPopover />
            </div>
          </div>

          <span className="hidden sm:block w-px h-6 bg-black/10 mx-1" />

          {/* AUTH */}
          {isAuthenticated ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => { setShowUserMenu((o) => !o); setShowLangMenu(false); }}
                aria-haspopup="menu"
                aria-expanded={showUserMenu}
                aria-label={t("nav.profile")}
                className="flex items-center gap-2 h-10 ps-1 pe-2 sm:pe-2.5 rounded-full hover:bg-green-50 active:scale-95 transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white ring-2 ring-white shadow-sm shrink-0 text-xs font-bold">
                  {initials || <UserRound className="w-[18px] h-[18px]" strokeWidth={2.2} />}
                </div>
                {firstNameOnly && (
                  <span className="hidden sm:block max-w-[96px] truncate text-sm font-semibold text-[#111827]">
                    {firstNameOnly}
                  </span>
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-500 hidden sm:block transition-transform duration-300 ${
                    showUserMenu ? "rotate-180 text-green-600" : ""
                  }`}
                />
              </button>

              {/* Dropdown — click-toggled, stays open until you click away / pick an item */}
              {showUserMenu && (
                <div className="absolute end-0 mt-2 w-60 bg-white border border-black/[0.06] rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-down">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-[#111827] to-green-700">
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur flex items-center justify-center text-white shrink-0 text-sm font-bold">
                      {initials || <UserRound className="w-5 h-5" strokeWidth={2.2} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {fullName || t("nav.profile")}
                      </p>
                      <p className="text-xs text-green-100/80 truncate" dir="ltr">
                        {user?.phone || user?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col py-1.5 text-sm">
                    <button
                      onClick={() => goTo("/profile")}
                      className="group/i flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition text-start text-gray-700 hover:text-green-700"
                    >
                      <User className="w-4 h-4 text-gray-400 group-hover/i:text-green-600" />
                      {t("nav.profile")}
                    </button>
                    <button
                      onClick={() => goTo("/orders")}
                      className="group/i flex items-center gap-3 px-4 py-2.5 hover:bg-green-50 transition text-start text-gray-700 hover:text-green-700"
                    >
                      <Package className="w-4 h-4 text-gray-400 group-hover/i:text-green-600" />
                      {t("nav.orders")}
                    </button>
                    <div className="border-t border-gray-100 mt-1.5 pt-1.5">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-start text-red-500 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        {t("nav.logout")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="btn-press h-10 px-5 text-sm rounded-full border border-black/10 hover:border-green-500 hover:text-green-600 transition-colors text-[#111827] font-semibold"
              >
                {t("nav.login")}
              </button>
              <button
                onClick={() => navigate("/register")}
                className="btn-press h-10 px-5 text-sm rounded-full bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white font-semibold shadow-sm hover:shadow-lg hover:shadow-green-500/30 transition-shadow"
              >
                {t("nav.register")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE MENU */}
      {openMenu && (
        <div
          ref={mobileRef}
          className="lg:hidden border-t border-black/[0.06] px-4 pb-5 pt-4 space-y-4 bg-white/95 backdrop-blur-xl"
        >
          <div data-mobile-item>
            <SearchBar />
          </div>
          <nav className="flex flex-col">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpenMenu(false)}
                data-mobile-item
                className={({ isActive }) =>
                  `flex items-center justify-between py-3.5 border-b border-gray-100 text-sm font-semibold uppercase tracking-[0.14em] transition-colors ${
                    isActive ? "text-[#16A34A]" : "text-[#111827]/80 hover:text-[#111827]"
                  }`
                }
              >
                {link.label}
                <ChevronDown className="w-4 h-4 -rotate-90 rtl:rotate-90 opacity-40" />
              </NavLink>
            ))}
          </nav>
          {!isAuthenticated && (
            <div data-mobile-item className="flex gap-3 pt-1">
              <button
                onClick={() => { navigate("/login"); setOpenMenu(false); }}
                className="btn-press flex-1 py-3 text-sm font-semibold border border-black/10 rounded-full text-[#111827] hover:border-green-500 hover:text-green-600 transition-colors"
              >
                {t("nav.login")}
              </button>
              <button
                onClick={() => { navigate("/register"); setOpenMenu(false); }}
                className="btn-press flex-1 py-3 text-sm font-semibold bg-gradient-to-r from-[#16A34A] to-[#15803D] text-white rounded-full shadow-sm hover:shadow-lg hover:shadow-green-500/30 transition-shadow"
              >
                {t("nav.register")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
