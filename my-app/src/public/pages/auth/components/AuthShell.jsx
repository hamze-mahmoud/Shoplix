import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Full-screen branded backdrop for the auth pages (no navbar). A dark
// green/black brand gradient over a faded retail image, soft green glows, and
// the Shoplix wordmark up top — the form card sits centered on top.
export default function AuthShell({ children }) {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#0b0f0b] px-4 py-10">
      {/* faded brand image */}
      <img
        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-20"
      />
      {/* dark green brand overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#111827]/95 via-[#0d2a18]/92 to-[#0b0f0b]/97" />
      {/* soft green glows */}
      <div className="absolute -top-28 -start-28 w-96 h-96 bg-green-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -end-28 w-96 h-96 bg-green-600/12 rounded-full blur-3xl pointer-events-none" />

      {/* content */}
      <div className="relative z-10 w-full flex flex-col items-center gap-7">
        <Link
          to="/"
          className="font-display text-4xl leading-none tracking-tight text-white hover:text-green-400 transition-colors"
        >
          Shoplix<span className="text-green-500">.</span>
        </Link>

        {children}

        <p className="text-xs text-white/45 tracking-wide">
          {t("auth.shell_tagline", "Shop in a new dimension")}
        </p>
      </div>
    </div>
  );
}
