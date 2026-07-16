import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { Phone, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { toastService } from "../../../Shared/services/toastService";
import { authService } from "../../../Shared/services/authService";
import { AuthContext } from "../../../Shared/AuthContext";
import AuthShell from "./components/AuthShell";
import WhatsAppNote from "./components/WhatsAppNote";
import WhatsAppTapVerify from "./components/WhatsAppTapVerify";

import { normalizeLocalPhone, isValidMobile } from "./phoneUtils";

// Password strength meter
function PasswordStrength({ password }) {
  const { t } = useTranslation();

  const getStrength = (p) => {
    if (!p) return null;
    if (p.length < 6)
      return { level: 0, label: t("auth.password_strength_weak"), color: "bg-red-400" };
    if (p.match(/[A-Z]/) && p.match(/[0-9]/) && p.length >= 8)
      return { level: 2, label: t("auth.password_strength_strong"), color: "bg-green-500" };
    return { level: 1, label: t("auth.password_strength_medium"), color: "bg-yellow-400" };
  };

  const strength = getStrength(password);
  if (!strength) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i <= strength.level ? strength.color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-gray-500">{strength.label}</p>
    </div>
  );
}

// Reusable input (RTL-aware via logical properties)
function InputField({ icon: Icon, name, type = "text", placeholder, value, onChange, error, rightEl }) {
  return (
    <div>
      <div className="relative">
        {Icon && <Icon className="absolute start-3 top-3.5 w-4 h-4 text-gray-400" />}
        <input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full ${Icon ? "ps-10" : "px-4"} ${
            rightEl ? "pe-10" : "pe-4"
          } py-3 rounded-xl bg-gray-100 focus:bg-white border ${
            error ? "border-red-400" : "border-transparent"
          } focus:ring-2 focus:ring-green-400 outline-none transition text-sm`}
        />
        {rightEl && <div className="absolute end-3 top-3">{rightEl}</div>}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function Register() {
  const { t } = useTranslation();
  const containerRef = useRef();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  // +970 (Palestine) / +972 (Israel) prefix for the phone field.
  const [countryCode, setCountryCode] = useState("970");
  // After signup the account exists but is unverified — this holds the phone
  // while the user enters the WhatsApp OTP.
  const [pending, setPending] = useState(null);

  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name required";
    if (!isValidMobile(normalizeLocalPhone(form.phone)))
      newErrors.phone = t("auth.invalid_phone");
    if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Step 1: create the account UNVERIFIED and get a code the customer sends
      // to our WhatsApp to prove ownership (tap-to-verify — no OTP send needed).
      const phone = `+${countryCode}${normalizeLocalPhone(form.phone)}`;
      const res = await authService.waStart({ ...form, phone });
      setPending(res.data); // { token, code, waLink, businessNumber }
    } catch (err) {
      const e = err.response?.data?.error;
      toastService.error(typeof e === "string" ? e : e?.message || t("auth.register_failed", "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  // Step 2 done: the backend confirmed the code and issued a session.
  const handleVerified = (user, accessToken) => {
    login(user, accessToken);
    toastService.success(t("auth.account_created", "Account created!"));
    navigate("/", { replace: true });
  };

  return (
    <AuthShell>
      <div
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-white/10"
      >
        {pending ? (
          /* STEP 2 — tap-to-verify on WhatsApp */
          <WhatsAppTapVerify
            start={pending}
            onVerified={handleVerified}
            onBack={() => setPending(null)}
          />
        ) : (
        <>
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {t("auth.create_account")}
          </h2>
          <p className="text-gray-500 text-sm">{t("auth.register_subtitle")}</p>
        </div>

        {/* WhatsApp verification notice */}
        <WhatsAppNote />

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <InputField
              icon={User}
              name="firstName"
              placeholder={t("auth.first_name")}
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <InputField
              icon={User}
              name="lastName"
              placeholder={t("auth.last_name")}
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>

          {/* PHONE — +970/+972 prefix + local mobile (row forced LTR:
              phone numbers read left-to-right in Arabic/Hebrew too) */}
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
                  name="phone"
                  type="tel"
                  dir="ltr"
                  placeholder={t("auth.phone_placeholder")}
                  value={form.phone}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 focus:bg-white border ${
                    errors.phone ? "border-red-400" : "border-transparent"
                  } focus:ring-2 focus:ring-green-400 outline-none transition text-sm`}
                />
              </div>
            </div>
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <InputField
              icon={Lock}
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={t("auth.password")}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <PasswordStrength password={form.password} />
          </div>

          <InputField
            icon={Lock}
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            placeholder={t("auth.confirm_password")}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            rightEl={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t(loading ? "auth.creating" : "auth.create")}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500">
          {t("auth.already_account")}{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            {t("auth.sign_in")}
          </Link>
        </p>
        </>
        )}
      </div>
    </AuthShell>
  );
}
