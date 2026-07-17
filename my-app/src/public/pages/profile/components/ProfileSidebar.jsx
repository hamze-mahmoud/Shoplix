import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Lock, Package } from "lucide-react";

// Left rail. `active` / `onSelect` drive the in-page tabs (account info vs.
// password); Orders navigates to the dedicated orders page.
export default function ProfileSidebar({ active, onSelect }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const tabClass = (key) =>
    `flex items-center gap-2 text-start px-3 py-2 rounded-lg transition ${
      active === key
        ? "bg-green-50 text-green-700 font-medium"
        : "text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div className="w-64 shrink-0 bg-white rounded-2xl shadow-sm p-4 h-fit">
      <div className="mb-6">
        <p className="font-semibold">{t("profile.title", "My Account")}</p>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <button className={tabClass("account")} onClick={() => onSelect("account")}>
          <User className="w-4 h-4" />
          {t("profile.nav_profile", "Profile")}
        </button>

        <button
          className="flex items-center gap-2 text-start px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          onClick={() => navigate("/orders")}
        >
          <Package className="w-4 h-4" />
          {t("profile.nav_orders", "Orders")}
        </button>

        <button className={tabClass("password")} onClick={() => onSelect("password")}>
          <Lock className="w-4 h-4" />
          {t("profile.nav_settings", "Password")}
        </button>
      </div>
    </div>
  );
}
