import { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import { User, Phone, Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import ProfileSidebar from "./components/ProfileSidebar";
import ProfileHeader from "./components/ProfileHeader";
import { userService } from "../../../Shared/services/userService";
import { toastService } from "../../../Shared/services/toastService";
import { AuthContext } from "../../../Shared/AuthContext";

// Reusable labelled field (RTL-aware via logical properties)
function Field({ icon: Icon, label, error, rightEl, ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-xs font-medium text-gray-500">{label}</label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute start-3 top-3.5 h-4 w-4 text-gray-400" />}
        <input
          {...props}
          className={`w-full ${Icon ? "ps-10" : "px-4"} ${
            rightEl ? "pe-10" : "pe-4"
          } rounded-xl border bg-gray-100 py-3 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-green-400 ${
            error ? "border-red-400" : "border-transparent"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        />
        {rightEl && <div className="absolute end-3 top-3">{rightEl}</div>}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-500 to-[#16A34A] px-6 py-2.5 font-semibold text-white shadow-sm transition hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export default function Profile() {
  const { t } = useTranslation();
  const { login } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("account"); // account | password

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userService.getCurrentUser();
        setUser(data);
      } catch (err) {
        console.error("Failed to load user", err);
        toastService.error(t("profile.update_failed", "Update failed"));
      }
    })();
  }, [t]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 md:flex-row">
      <ProfileSidebar active={tab} onSelect={setTab} />

      <div className="flex-1 space-y-6">
        <ProfileHeader user={user} />

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          {tab === "account" ? (
            <AccountForm user={user} setUser={setUser} login={login} />
          ) : (
            <PasswordForm />
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account info — edit first/last name + phone (email is read-only)
// ---------------------------------------------------------------------------
function AccountForm({ user, setUser, login }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Hydrate the form once the user loads / changes.
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = t("profile.first_name", "First Name");
    // 9–15 digits, country code optional
    const digits = form.phone.replace(/\D/g, "");
    if (digits && (digits.length < 9 || digits.length > 15))
      next.phone = t("profile.invalid_phone", "Please enter a valid phone number");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await userService.updateProfile(form);
      setUser(data);
      login(data); // keep the navbar / context name in sync (no new token)
      toastService.success(t("profile.profile_updated", "Profile updated"));
    } catch (err) {
      const msg = err.response?.data?.error;
      toastService.error(typeof msg === "string" ? msg : t("profile.update_failed", "Update failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {t("profile.account_info", "Account Info")}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          icon={User}
          label={t("profile.first_name", "First Name")}
          name="firstName"
          value={form.firstName}
          onChange={change}
          error={errors.firstName}
        />
        <Field
          icon={User}
          label={t("profile.last_name", "Last Name")}
          name="lastName"
          value={form.lastName}
          onChange={change}
        />
        <Field
          icon={Phone}
          label={t("profile.phone", "Phone")}
          name="phone"
          type="tel"
          dir="ltr"
          value={form.phone}
          onChange={change}
          error={errors.phone}
        />
        <div>
          <Field
            icon={Mail}
            label={t("profile.email", "Email")}
            name="email"
            value={user?.email || ""}
            disabled
            readOnly
          />
          <p className="mt-1 text-xs text-gray-400">{t("profile.email_hint", "Email can't be changed")}</p>
        </div>
      </div>

      <SubmitButton loading={loading}>
        {t(loading ? "profile.saving" : "profile.save_changes", "Save Changes")}
      </SubmitButton>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Change password — current + new + confirm
// ---------------------------------------------------------------------------
function PasswordForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.currentPassword) next.currentPassword = " ";
    if (form.newPassword.length < 6)
      next.newPassword = t("profile.password_min", "At least 6 characters");
    if (form.newPassword !== form.confirm)
      next.confirm = t("profile.passwords_mismatch", "Passwords do not match");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await userService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toastService.success(t("profile.password_updated", "Password updated"));
      setForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      const msg = err.response?.data?.error;
      toastService.error(typeof msg === "string" ? msg : t("profile.update_failed", "Update failed"));
    } finally {
      setLoading(false);
    }
  };

  const eyeToggle = (
    <button type="button" onClick={() => setShow(!show)} className="text-gray-400 hover:text-gray-600">
      {show ? <EyeOff size={16} /> : <Eye size={16} />}
    </button>
  );

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {t("profile.change_password", "Change Password")}
      </h2>

      <Field
        icon={Lock}
        label={t("profile.current_password", "Current Password")}
        name="currentPassword"
        type={show ? "text" : "password"}
        value={form.currentPassword}
        onChange={change}
        error={errors.currentPassword}
        rightEl={eyeToggle}
      />
      <Field
        icon={Lock}
        label={t("profile.new_password", "New Password")}
        name="newPassword"
        type={show ? "text" : "password"}
        value={form.newPassword}
        onChange={change}
        error={errors.newPassword}
      />
      <Field
        icon={Lock}
        label={t("profile.confirm_password", "Confirm New Password")}
        name="confirm"
        type={show ? "text" : "password"}
        value={form.confirm}
        onChange={change}
        error={errors.confirm}
      />

      <SubmitButton loading={loading}>
        {t(loading ? "profile.saving" : "profile.update_password", "Update Password")}
      </SubmitButton>
    </form>
  );
}
