import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MessageCircle, Loader2, CheckCircle2, ArrowLeft, Copy } from "lucide-react";
import { authService } from "../../../../Shared/services/authService";
import { toastService } from "../../../../Shared/services/toastService";

// Tap-to-verify: the customer proves they own their number by sending a secret
// code from it to our business WhatsApp. We poll wa-status until the inbound
// webhook matches it — no OTP send, no template, no business verification.
export default function WhatsAppTapVerify({ start, onVerified, onBack }) {
  const { t } = useTranslation();
  const { token, code, waLink, businessNumber } = start;
  const [state, setState] = useState("waiting"); // waiting | verified | expired
  const timer = useRef(null);

  useEffect(() => {
    let active = true;
    const poll = async () => {
      try {
        const { data } = await authService.waStatus(token);
        if (!active) return;
        if (data.verified) {
          setState("verified");
          clearInterval(timer.current);
          setTimeout(() => onVerified(data.user, data.accessToken), 900);
        }
      } catch (err) {
        if (!active) return;
        if (err.response?.status === 404) {
          setState("expired");
          clearInterval(timer.current);
        }
      }
    };
    timer.current = setInterval(poll, 2500);
    return () => {
      active = false;
      clearInterval(timer.current);
    };
  }, [token, onVerified]);

  const copyCode = () => {
    navigator.clipboard?.writeText(code);
    toastService.success(t("auth.wa_code_copied", "Code copied"));
  };

  if (state === "verified") {
    return (
      <div className="text-center py-8 space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">{t("auth.wa_verified", "Verified!")}</h2>
        <p className="text-gray-500 text-sm">{t("auth.wa_verified_sub", "Signing you in…")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
        {t("common.back", "Back")}
      </button>

      <div className="text-center space-y-1">
        <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center mx-auto mb-2">
          <MessageCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          {t("auth.wa_verify_title", "Verify on WhatsApp")}
        </h2>
        <p className="text-gray-500 text-sm">
          {t("auth.wa_verify_sub", "One tap — send us this code from your WhatsApp and you're in.")}
        </p>
      </div>

      {state === "expired" ? (
        <div className="text-center bg-amber-50 text-amber-700 rounded-xl p-4 text-sm">
          {t("auth.wa_expired", "This request expired. Go back and try again.")}
        </div>
      ) : (
        <>
          {/* The code */}
          <button
            type="button"
            onClick={copyCode}
            className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 rounded-xl py-3 transition"
            title={t("auth.wa_code_copy", "Copy code")}
          >
            <span dir="ltr" className="font-mono text-2xl font-bold tracking-[0.2em] text-gray-900">
              {code}
            </span>
            <Copy className="w-4 h-4 text-gray-400" />
          </button>

          {/* Primary CTA: open WhatsApp with the code pre-filled */}
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3.5 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition"
            >
              <MessageCircle className="w-5 h-5" />
              {t("auth.wa_open_button", "Open WhatsApp & send")}
            </a>
          ) : (
            <div className="text-center bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              {t("auth.wa_manual", "Send the code above on WhatsApp to")}{" "}
              <b dir="ltr">+{businessNumber}</b>
            </div>
          )}

          {/* Waiting indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("auth.wa_waiting", "Waiting for your message…")}
          </div>

          <p className="text-center text-xs text-gray-400">
            {t("auth.wa_hint", "Tap the button, press send in WhatsApp, then come back here — it verifies automatically.")}
          </p>
        </>
      )}
    </div>
  );
}
