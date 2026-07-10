import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// three.js product avenue lives in its own lazy chunk
const AuthAvenue3D = lazy(() => import("./AuthAvenue3D"));

// Auth backdrop: a night-street scene where product images flank both sides
// like buildings, receding toward a glowing "moon", with the form centered on
// the road. The 3D avenue drifts endlessly toward the camera (GSAP fly-in +
// continuous motion). A dark sky gradient + moon glow render in CSS behind the
// canvas for reliability; side vignettes keep the centered form readable.
export default function AuthShell({ children }) {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* night sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a2e] via-[#1a0f3d] to-[#05030f]" />
      {/* glowing moon (upper-center) */}
      <div className="absolute top-[14%] left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[radial-gradient(circle,#fdf4ff_0%,#e9d5ff_35%,rgba(168,85,247,0.25)_60%,transparent_72%)] blur-[2px] pointer-events-none" />
      {/* faint star field */}
      <div
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20% 18%, #fff, transparent)," +
            "radial-gradient(1.5px 1.5px at 68% 12%, #fff, transparent)," +
            "radial-gradient(1px 1px at 42% 26%, #fff, transparent)," +
            "radial-gradient(1px 1px at 82% 22%, #fff, transparent)," +
            "radial-gradient(1.5px 1.5px at 12% 34%, #fff, transparent)," +
            "radial-gradient(1px 1px at 55% 8%, #fff, transparent)",
        }}
      />

      {/* the 3D product avenue */}
      <div className="absolute inset-0" aria-hidden="true">
        <Suspense fallback={null}>
          <AuthAvenue3D />
        </Suspense>
      </div>

      {/* left/right vignettes so the centered form stays readable */}
      <div className="absolute inset-y-0 left-0 w-1/3 pointer-events-none bg-gradient-to-r from-[#05030f]/80 to-transparent" />
      <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none bg-gradient-to-l from-[#05030f]/80 to-transparent" />
      {/* soft center backing directly behind the card for contrast */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[620px] max-w-[95vw] pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(5,3,15,0.72)_0%,rgba(5,3,15,0.35)_55%,transparent_75%)]" />

      {/* content */}
      <div className="relative z-10 w-full flex flex-col items-center gap-7">
        <Link
          to="/"
          className="font-display text-4xl leading-none tracking-tight text-white hover:text-purple-300 transition-colors drop-shadow-[0_2px_12px_rgba(168,85,247,0.5)]"
        >
          Shoplix<span className="text-purple-400">.</span>
        </Link>

        {children}

        <p className="text-xs text-white/50 tracking-wide">
          {t("auth.shell_tagline", "Shop in a new dimension")}
        </p>
      </div>
    </div>
  );
}
