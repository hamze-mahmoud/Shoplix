import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { authService } from "../../../../Shared/services/authService";
import { toastService } from "../../../../Shared/services/toastService";

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

// Step 2 of phone signup: enter the 6-digit code sent to the user's WhatsApp.
// Used by Register (right after signup) and Login (when an unverified account
// tries to sign in — pass autoSend so a fresh code goes out on mount).
// onVerified(user, accessToken) fires once the backend confirms the code.
export default function OtpVerify({ phone, autoSend = false, onVerified, onBack }) {
  const { t } = useTranslation();

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  const inputsRef = useRef([]);
  const autoSentRef = useRef(false);

  // "+970 599123456" when the number carries a country code, as-typed otherwise.
  const digitsOnly = String(phone || "").replace(/\D/g, "");
  const ccMatch = digitsOnly.match(/^(970|972)(\d+)$/);
  const displayPhone = ccMatch ? `+${ccMatch[1]} ${ccMatch[2]}` : phone;

  useEffect(() => {
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // Coming from Login there may be no live code — request one on mount.
  useEffect(() => {
    if (!autoSend || autoSentRef.current) return;
    autoSentRef.current = true;
    resend(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSend]);

  const submit = async (code) => {
    if (verifying || code.length !== CODE_LENGTH) return;
    setVerifying(true);
    setError("");
    try {
      const res = await authService.verifyOtp({ phone, code });
      onVerified(res.data.user, res.data.accessToken);
    } catch (err) {
      const data = err.response?.data;
      if (data?.expired) setError(t("auth.otp_expired"));
      else if (typeof data?.attemptsLeft === "number") setError(t("auth.otp_invalid"));
      else setError(typeof data?.error === "string" ? data.error : t("auth.otp_invalid"));
      setDigits(Array(CODE_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const resend = async (silent = false) => {
    setResending(true);
    setError("");
    try {
      await authService.resendOtp({ phone });
      setCooldown(RESEND_SECONDS);
      if (!silent) toastService.success(t("auth.otp_resent"));
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 429 && data?.retryAfter) {
        // A recent code is still valid — just sync the countdown.
        setCooldown(data.retryAfter);
      } else {
        setError(typeof data?.error === "string" ? data.error : t("common.error", "Something went wrong"));
      }
    } finally {
      setResending(false);
    }
  };

  const handleChange = (i, raw) => {
    const v = raw.replace(/\D/g, "");
    setError("");

    // Pasting the whole code into any box fills the row.
    if (v.length >= 4) {
      const next = Array(CODE_LENGTH).fill("");
      v.slice(0, CODE_LENGTH).split("").forEach((d, j) => { next[j] = d; });
      setDigits(next);
      inputsRef.current[Math.min(v.length, CODE_LENGTH - 1)]?.focus();
      if (v.length >= CODE_LENGTH) submit(next.join(""));
      return;
    }

    const d = v.slice(-1);
    const next = [...digits];
    next[i] = d;
    setDigits(next);
    if (d && i < CODE_LENGTH - 1) inputsRef.current[i + 1]?.focus();
    if (next.every(Boolean)) submit(next.join(""));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      setDigits(next);
      inputsRef.current[i - 1]?.focus();
    }
  };

  const complete = digits.every(Boolean);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="#25D366" aria-hidden="true" className="w-7 h-7">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">{t("auth.otp_title")}</h2>
        <p className="text-gray-500 text-sm">
          {t("auth.otp_subtitle")}{" "}
          <span dir="ltr" className="font-semibold text-gray-700">{displayPhone}</span>
        </p>
      </div>

      {/* CODE BOXES (always LTR — codes read left-to-right in ar/he too) */}
      <div dir="ltr" className="flex justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            disabled={verifying}
            aria-label={`Digit ${i + 1}`}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl bg-gray-100 focus:bg-white border ${
              error ? "border-red-400" : "border-transparent"
            } focus:ring-2 focus:ring-green-400 outline-none transition disabled:opacity-60`}
          />
        ))}
      </div>

      {error && <p className="text-center text-red-500 text-sm">{error}</p>}

      {/* VERIFY */}
      <button
        onClick={() => submit(digits.join(""))}
        disabled={verifying || !complete}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
        {t(verifying ? "auth.otp_verifying" : "auth.otp_verify")}
      </button>

      {/* RESEND + BACK */}
      <div className="flex items-center justify-between text-sm">
        {cooldown > 0 ? (
          <span className="text-gray-400">{t("auth.otp_resend_in", { s: cooldown })}</span>
        ) : (
          <button
            type="button"
            onClick={() => resend(false)}
            disabled={resending}
            className="flex items-center gap-1.5 text-green-600 font-semibold hover:underline disabled:opacity-60"
          >
            {resending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t("auth.otp_resend")}
          </button>
        )}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 hover:underline"
          >
            {t("auth.otp_change_number")}
          </button>
        )}
      </div>
    </div>
  );
}
