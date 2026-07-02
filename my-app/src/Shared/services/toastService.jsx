import toast from "react-hot-toast";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bell,
  Lock,
  LogIn,
  UserPlus,
  Loader2,
  X,
} from "lucide-react";

import i18n from "../../i18n";
import { navigateTo } from "./navigation";

/**
 * Centralized, themed toast system.
 *
 * Professional card-style toasts that match the app theme (neutral surface,
 * #111827 ink, #E5E7EB borders, semantic accent colors). RTL-aware. Every
 * alert in the app should go through this service so they stay consistent.
 */

// Theme per variant: { Icon, accent (bar + icon), tint (icon chip bg) }
const VARIANTS = {
  success: { Icon: CheckCircle2, accent: "#16A34A", tint: "#ECFDF5" },
  error: { Icon: AlertCircle, accent: "#DC2626", tint: "#FEF2F2" },
  warning: { Icon: AlertTriangle, accent: "#D97706", tint: "#FFFBEB" },
  info: { Icon: Info, accent: "#2563EB", tint: "#EFF6FF" },
  auth: { Icon: Lock, accent: "#2563EB", tint: "#EFF6FF" },
  notify: { Icon: Bell, accent: "#2563EB", tint: "#EFF6FF" },
  loading: { Icon: Loader2, accent: "#2563EB", tint: "#EFF6FF" },
};

const DEFAULT_DURATION = {
  success: 3500,
  error: 4500,
  warning: 4000,
  info: 4000,
  notify: 4500,
  auth: 7000,
};

function ToastCard({ t, variant, message, desc, duration, children }) {
  const { Icon, accent, tint } = VARIANTS[variant] || VARIANTS.info;
  const dir = i18n.dir();
  const rtl = dir === "rtl";
  const showBar = Number.isFinite(duration) && duration > 0;
  const spinning = variant === "loading";

  return (
    <div
      dir={dir}
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white border border-[#E5E7EB] shadow-[0_12px_40px_-12px_rgba(17,24,39,0.28)] transition-all duration-300 ease-out ${
        t.visible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-2 scale-95"
      }`}
    >
      <div className="relative flex items-start gap-3 p-4 ps-5">
        {/* accent bar */}
        <span
          className="absolute inset-y-0 start-0 w-1.5"
          style={{ background: accent }}
        />

        {/* icon chip */}
        <div
          className="shrink-0 mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: tint, color: accent }}
        >
          <Icon className={`w-5 h-5 ${spinning ? "animate-spin" : ""}`} strokeWidth={2.2} />
        </div>

        {/* content */}
        <div className="min-w-0 flex-1 text-start">
          {message && (
            <p className="text-[14px] font-semibold text-[#111827] leading-snug break-words">
              {message}
            </p>
          )}
          {desc && (
            <p className="mt-0.5 text-[13px] text-[#6B7280] leading-snug break-words">
              {desc}
            </p>
          )}
          {children}
        </div>

        {/* close */}
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label={i18n.t("common.close")}
          className="shrink-0 -me-1 -mt-1 p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#111827] hover:bg-[#F3F4F6] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* auto-dismiss progress bar */}
      {showBar && (
        <span
          className="block h-[3px] opacity-40"
          style={{
            background: accent,
            transformOrigin: rtl ? "right" : "left",
            animation: `toast-bar ${duration}ms linear forwards`,
          }}
        />
      )}
    </div>
  );
}

function base(variant, message, { desc, duration, id } = {}) {
  const ms = duration ?? DEFAULT_DURATION[variant] ?? 4000;
  return toast.custom(
    (t) => (
      <ToastCard t={t} variant={variant} message={message} desc={desc} duration={ms} />
    ),
    { duration: ms, id }
  );
}

export const toastService = {
  success: (message, opts) => base("success", message, opts),
  error: (message, opts) => base("error", message, opts),
  warning: (message, opts) => base("warning", message, opts),
  info: (message, opts) => base("info", message, opts),
  notify: (message, opts) => base("notify", message, opts),

  loading: (message, opts = {}) =>
    toast.custom(
      (t) => (
        <ToastCard t={t} variant="loading" message={message} duration={Infinity} />
      ),
      { duration: Infinity, ...opts }
    ),

  /**
   * Auth-required prompt — shown when a guest tries a logged-in-only action
   * (e.g. add to cart). Friendly note + log in / create account actions.
   * De-duped via a fixed id so rapid clicks don't stack.
   */
  authRequired: ({ desc } = {}) => {
    const duration = DEFAULT_DURATION.auth;
    return toast.custom(
      (t) => (
        <ToastCard
          t={t}
          variant="auth"
          message={i18n.t("toast.sign_in_title")}
          desc={desc || i18n.t("toast.sign_in_desc")}
          duration={duration}
        >
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigateTo("/login");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-95 transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              {i18n.t("toast.login")}
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                navigateTo("/register");
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-[#F9FAFB] active:scale-95 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {i18n.t("toast.create_account")}
            </button>
          </div>
        </ToastCard>
      ),
      { duration, id: "auth-required" }
    );
  },

  /**
   * Themed confirm dialog as a toast. Resolves via callbacks.
   * variant controls the confirm button color (e.g. "error" for destructive).
   */
  confirm: ({
    message,
    desc,
    confirmLabel,
    cancelLabel,
    onConfirm,
    variant = "warning",
  }) => {
    const accent = (VARIANTS[variant] || VARIANTS.warning).accent;
    return toast.custom(
      (t) => (
        <ToastCard t={t} variant={variant} message={message} desc={desc} duration={Infinity}>
          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                onConfirm?.();
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[13px] font-semibold text-white active:scale-95 transition"
              style={{ background: accent }}
            >
              {confirmLabel || i18n.t("common.confirm")}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-[13px] font-semibold text-[#111827] border border-[#E5E7EB] hover:bg-[#F9FAFB] active:scale-95 transition"
            >
              {cancelLabel || i18n.t("common.cancel")}
            </button>
          </div>
        </ToastCard>
      ),
      { duration: Infinity }
    );
  },

  dismiss: (id) => toast.dismiss(id),
  dismiss_all: () => toast.remove(),
};

export function useToast() {
  return toastService;
}

export default toastService;
