import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "../../../../Shared/services/authService";
import { toastService } from "../../../../Shared/services/toastService";
import { normalizeLocalPhone, isValidMobile } from "../phoneUtils";

const RESEND_SECONDS = 60;

// Forgot-password flow, rendered inside the Login card:
//  step "phone" — enter the account's mobile → a reset code goes to WhatsApp
//  step "reset" — enter the code + a new password → account is signed in
// onDone(user, accessToken) receives the fresh session from the backend.
export default function ForgotPassword({ onDone, onBack }) {
  const { t } = useTranslation();

  const [step, setStep] = useState("phone");
  const [countryCode, setCountryCode] = useState("970");
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState(""); // the number the code was sent to
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCooldown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  // "+970 599123456" when the number carries a country code, as-is otherwise.
  const digitsOnly = String(phone || "").replace(/\D/g, "");
  const ccMatch = digitsOnly.match(/^(970|972)(\d+)$/);
  const displayPhone = ccMatch ? `+${ccMatch[1]} ${ccMatch[2]}` : phone;

  // Sends the reset code. Used by the phone step AND as "resend" on the
  // reset step (the backend cooldown throttles repeats).
  const sendCode = async ({ resend = false } = {}) => {
    const local = normalizeLocalPhone(phoneInput);
    if (!isValidMobile(local)) {
      setError(t("auth.invalid_phone"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.forgotPassword({ phone: `+${countryCode}${local}` });
      setPhone(res.data.phone || `${countryCode}${local}`);
      setCooldown(RESEND_SECONDS);
      setStep("reset");
      if (resend) toastService.success(t("auth.otp_resent"));
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 404) {
        setError(t("auth.reset_no_account"));
      } else if (err.response?.status === 429 && data?.retryAfter) {
        // A recent code is still valid — move on and sync the countdown.
        setPhone(`${countryCode}${local}`);
        setCooldown(data.retryAfter);
        setStep("reset");
      } else {
        setError(typeof data?.error === "string" ? data.error : t("auth.register_failed"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) {
      setError(t("auth.otp_invalid"));
      return;
    }
    if (newPassword.length < 6) {
      setError(t("auth.password_min"));
      return;
    }
    if (newPassword !== confirm) {
      setError(t("auth.passwords_mismatch"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authService.resetPassword({
        phone,
        code: code.trim(),
        newPassword,
      });
      toastService.success(t("auth.reset_success"));
      onDone(res.data.user, res.data.accessToken);
    } catch (err) {
      const data = err.response?.data;
      if (data?.expired) setError(t("auth.otp_expired"));
      else if (typeof data?.attemptsLeft === "number") setError(t("auth.otp_invalid"));
      else setError(typeof data?.error === "string" ? data.error : t("auth.otp_invalid"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">
          <Lock className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">{t("auth.reset_title")}</h2>
        <p className="text-gray-500 text-sm">
          {step === "phone" ? (
            t("auth.reset_phone_subtitle")
          ) : (
            <>
              {t("auth.otp_subtitle")}{" "}
              <span dir="ltr" className="font-semibold text-gray-700">{displayPhone}</span>
            </>
          )}
        </p>
      </div>

      {step === "phone" ? (
        /* STEP 1 — PHONE */
        <form
          onSubmit={(e) => { e.preventDefault(); sendCode(); }}
          className="space-y-4"
        >
          <div>
            <div className="flex gap-2" dir="ltr">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                aria-label="Country code"
                className="shrink-0 px-3 py-3 rounded-xl bg-gray-100 focus:bg-white border border-transparent focus:ring-2 focus:ring-green-400 outline-none transition text-sm font-semibold text-gray-700 cursor-pointer"
              >
                <option value="970">+970</option>
                <option value="972">+972</option>
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  dir="ltr"
                  autoFocus
                  placeholder={t("auth.phone_placeholder")}
                  value={phoneInput}
                  onChange={(e) => { setPhoneInput(e.target.value); setError(""); }}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 focus:bg-white border ${
                    error ? "border-red-400" : "border-transparent"
                  } focus:ring-2 focus:ring-green-400 outline-none transition text-sm`}
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("auth.reset_send_code")}
          </button>
        </form>
      ) : (
        /* STEP 2 — CODE + NEW PASSWORD */
        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            maxLength={6}
            autoFocus
            placeholder="••••••"
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setError(""); }}
            className="w-full py-3 rounded-xl bg-gray-100 focus:bg-white border border-transparent focus:ring-2 focus:ring-green-400 outline-none transition text-center text-2xl font-bold tracking-[0.5em]"
          />

          <div className="relative">
            <Lock className="absolute start-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              placeholder={t("auth.new_password")}
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
              className="w-full ps-10 pe-10 py-3 rounded-xl bg-gray-100 focus:bg-white border border-transparent focus:ring-2 focus:ring-green-400 outline-none transition text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute end-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="relative">
            <Lock className="absolute start-3 top-3.5 w-4 h-4 text-gray-400" />
            <input
              type={showPw ? "text" : "password"}
              placeholder={t("auth.confirm_password")}
              value={confirm}
              onChange={(e) => { setConfirm(e.target.value); setError(""); }}
              className="w-full ps-10 pe-4 py-3 rounded-xl bg-gray-100 focus:bg-white border border-transparent focus:ring-2 focus:ring-green-400 outline-none transition text-sm"
            />
          </div>

          {error && <p className="text-center text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t("auth.reset_submit")}
          </button>

          <div className="flex items-center justify-between text-sm">
            {cooldown > 0 ? (
              <span className="text-gray-400">{t("auth.otp_resend_in", { s: cooldown })}</span>
            ) : (
              <button
                type="button"
                onClick={() => sendCode({ resend: true })}
                disabled={loading}
                className="text-green-600 font-semibold hover:underline disabled:opacity-60"
              >
                {t("auth.otp_resend")}
              </button>
            )}
          </div>
        </form>
      )}

      <p className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          {t("auth.back_to_login")}
        </button>
      </p>
    </div>
  );
}
