import { useTranslation } from "react-i18next";

export default function RecentActivity() {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="mb-4 font-semibold">{t("admin.dashboard.recent_activity")}</h2>

      <ul className="space-y-2 text-sm">
        <li>{t("admin.dashboard.activity_user")}</li>
        <li>{t("admin.dashboard.activity_order")}</li>
        <li>{t("admin.dashboard.activity_product")}</li>
      </ul>
    </div>
  );
}