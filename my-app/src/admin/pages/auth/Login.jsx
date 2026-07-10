import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuth from "../../../Shared/hooks/useAuth";
import { authService } from "../../../Shared/services/authService";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // Authenticate against the backend, then hand the verified user + token
      // to the auth context (token → memory, refresh session → httpOnly cookie).
      const { data } = await authService.login({
        identifier: form.email,
        password: form.password,
      });

      if (data.user?.role !== "admin") {
        setError(t("admin.auth.not_admin", "This account is not an administrator."));
        return;
      }

      login(data.user, data.accessToken);
      navigate("/admin", { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.error || t("admin.auth.login_failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-[350px] space-y-4"
      >
        <h1 className="text-xl font-bold text-center">
          {t("admin.auth.login_title")}
        </h1>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder={t("admin.users.col_email")}
          className="border p-2 w-full"
          value={form.email}
          onChange={(e) =>
            handleChange("email", e.target.value)
          }
        />

        <input
          type="password"
          placeholder={t("admin.users.password")}
          className="border p-2 w-full"
          value={form.password}
          onChange={(e) =>
            handleChange("password", e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white w-full p-2 rounded"
        >
          {loading ? t("admin.auth.logging_in") : t("admin.auth.login")}
        </button>
      </form>
    </div>
  );
}