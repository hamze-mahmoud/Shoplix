import { useState, useEffect, useRef, useContext } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { authService } from "../../../Shared/services/authService";
import { AuthContext } from "../../../Shared/AuthContext";
import { gsap } from "gsap";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import SocialAuth from "./components/SocialAuth";
import AuthShell from "./components/AuthShell";

export default function Login() {
  const containerRef = useRef();

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

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

    if (!form.email.includes("@")) {
      newErrors.email = "Enter a valid email";
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await authService.login(form);

      const { accessToken, user } = res.data;
      // Store token + user via context so every consumer (Navbar included) re-renders immediately
      login(user, accessToken);

      // 🚀 redirect: admins to dashboard, others back where they came from
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(from || "/", { replace: true });
      }

    } catch (err) {
      setMessage(err.response?.data?.error || "Login failed");
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

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* EMAIL */}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input
                name="email"
                placeholder={t("auth.email")}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-3 rounded-xl bg-gray-100 focus:bg-white border ${
                  errors.email ? "border-red-400" : "border-transparent"
                } focus:ring-2 focus:ring-green-400 outline-none transition`}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
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

          {/* BUTTON */}
          <button
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-[#16A34A] text-white py-3 rounded-xl font-semibold shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-70"
          >
            {loading ? t("auth.logging_in") : t("auth.login")}
          </button>

        </form>

        <SocialAuth />

        <p className="text-center text-sm text-gray-500">
          {t("auth.no_account")}{" "}
          <Link
            to="/register"
            className="text-green-600 font-semibold hover:underline"
          >
            {t("auth.register")}
          </Link>
        </p>

      </div>
    </AuthShell>
  );
}