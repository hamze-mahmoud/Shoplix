import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";
import { toastService } from "../../../Shared/services/toastService";
import { authService } from "../../../Shared/services/authService";
import SocialAuth from "./components/SocialAuth";
import AuthShell from "./components/AuthShell";

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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    if (form.password.length < 6) newErrors.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Poll for email verification (no memory leaks)
  const startVerificationCheck = (email) => {
    setChecking(true);
    let attempts = 0;

    const interval = setInterval(async () => {
      try {
        const res = await authService.checkIsVerified(email);

        if (res.data.verified) {
          clearInterval(interval);
          setChecking(false);
          navigate("/login?verified=true");
        }

        if (++attempts >= 60) {
          clearInterval(interval);
          setChecking(false);
          toastService.warning(t("auth.verify_timeout"));
        }
      } catch {
        // keep polling silently
      }
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await authService.register(form);
      toastService.success(res.data.message || t("auth.account_created", "Account created!"));
      startVerificationCheck(form.email);
    } catch (err) {
      const e = err.response?.data?.error;
      toastService.error(typeof e === "string" ? e : e?.message || t("auth.register_failed", "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6 border border-white/10"
      >
        {/* HEADER */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-gray-900">
            {t("auth.create_account")}
          </h2>
          <p className="text-gray-500 text-sm">{t("auth.register_subtitle")}</p>
        </div>

        {/* VERIFICATION BANNER */}
        {checking && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-xl">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{t("auth.verify_email")}</span>
          </div>
        )}

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

          <InputField
            icon={Mail}
            name="email"
            type="email"
            placeholder={t("auth.email")}
            value={form.email}
            onChange={handleChange}
            error={errors.email}
          />

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
            disabled={loading || checking}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {t(loading ? "auth.creating" : "auth.create")}
          </button>
        </form>

        <SocialAuth />

        <p className="text-center text-sm text-gray-500">
          {t("auth.already_account")}{" "}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            {t("auth.sign_in")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
