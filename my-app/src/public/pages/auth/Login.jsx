import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../../../Shared/services/authService";
import { AuthContext } from "../../../Shared/AuthContext";
import { gsap } from "gsap";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import AuthShell from "./components/AuthShell";
import WhatsAppNote from "./components/WhatsAppNote";
import OtpVerify from "./components/OtpVerify";
import ForgotPassword from "./components/ForgotPassword";

export default function Login() {
  const containerRef = useRef();

  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  // Set when an unverified phone account tries to sign in — switches the card
  // to the WhatsApp code step (a fresh code is auto-sent on mount).
  const [pendingVerify, setPendingVerify] = useState(null);
  // Switches the card to the forgot-password flow (WhatsApp reset code).
  const [forgotOpen, setForgotOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const verified = params.get("verified");

  // Page the user was trying to reach before being sent to login
  const from = location.state?.from?.pathname;

  const { login } = useContext(AuthContext);
  const { t } = useTranslation();

  // 🎬 animation
  useEffect(() => {
    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }
    );
  }, []);

  const validate = () => {
    let newErrors = {};

    // Phone number (≥9 digits) or, for legacy/admin accounts, an email.
    const id = form.identifier.trim();
    const digits = id.replace(/\D/g, "");
    if (!(id.includes("@") ? /^\S+@\S+\.\S+$/.test(id) : digits.length >= 9)) {
      newErrors.identifier = t("auth.invalid_identifier");
    }

    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Store token + user via context so every consumer (Navbar included)
  // re-renders immediately, then redirect: admins to the dashboard, others
  // back where they came from. Shared by password login and OTP verification.
  const finishLogin = (user, accessToken) => {
    login(user, accessToken);
    if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate(from || "/", { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await authService.login(form);
      const { accessToken, user } = res.data;
      finishLogin(user, accessToken);
    } catch (err) {
      const data = err.response?.data;
      // Unverified phone account (signup never finished): move to the
      // WhatsApp code step instead of a dead-end error.
      if (err.response?.status === 403 && data?.needsVerification) {
        setPendingVerify({ phone: data.phone || form.identifier });
      } else {
        setMessage(data?.error || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div
        ref={containerRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/10 p-8 space-y-6"
      >
        {forgotOpen ? (
          /* Forgot password: WhatsApp reset code → new password */
          <ForgotPassword
            onDone={finishLogin}
            onBack={() => setForgotOpen(false)}
          />
        ) : pendingVerify ? (
          /* WhatsApp code entry for an unverified account */
          <OtpVerify
            phone={pendingVerify.phone}
            autoSend
            onVerified={finishLogin}
            onBack={() => setPendingVerify(null)}
          />
        ) : (
        <>

        {verified && (
          <div className="bg-green-100 text-green-700 text-sm p-2 rounded-lg text-center">
            {t("auth.email_verified")}
          </div>
        )}

        {message && (
          <div className="bg-red-100 text-red-600 text-sm p-2 rounded-lg text-center">
            {message}
          </div>
        )}

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold text-gray-800">
            {t("auth.welcome_back")}
          </h2>
          <p className="text-gray-500 text-sm">
            {t("auth.login_subtitle")}
          </p>
        </div>

        {/* WhatsApp verification notice */}
        <WhatsAppNote />

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* PHONE NUMBER (or email for admin/legacy accounts) */}
          <div>
            <div className="relative">
              <Phone className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="identifier"
                type="tel"
                dir="ltr"
                placeholder={t("auth.phone_placeholder")}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-3 rounded-xl bg-gray-100 focus:bg-white border ${
                  errors.identifier ? "border-red-400" : "border-transparent"
                } focus:ring-2 focus:ring-green-400 outline-none transition`}
              />
            </div>
            {errors.identifier && (
              <p className="text-red-500 text-xs mt-1">
                {errors.identifier}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />

              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("auth.password")}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 rounded-xl bg-gray-100 focus:bg-white border ${
                  errors.password ? "border-red-400" : "border-transparent"
                } focus:ring-2 focus:ring-green-400 outline-none transition`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* FORGOT PASSWORD */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-sm text-green-600 font-medium hover:underline"
            >
              {t("auth.forgot_password")}
            </button>
          </div>

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-70"
          >
            {loading ? t("auth.logging_in") : t("auth.login")}
          </button>

        </form>

        <p className="text-center text-sm text-gray-500">
          {t("auth.no_account")}{" "}
          <Link
            to="/register"
            className="text-green-600 font-semibold hover:underline"
          >
            {t("auth.register")}
          </Link>
        </p>

        </>
        )}
      </div>
    </AuthShell>
  );
}