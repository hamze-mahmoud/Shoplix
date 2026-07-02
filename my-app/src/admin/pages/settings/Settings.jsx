import { useTranslation } from "react-i18next";
import ProfileSettings from "./components/ProfileSettings";
import SystemSettings from "./components/SystemSettings";

export default function Settings() {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("admin.settings.title")}</h1>

      <ProfileSettings />
      <SystemSettings />
    </div>
  );
}