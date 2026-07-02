import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import useAuth from "../../Shared/hooks/useAuth";

const LANGS = [
  { code: "en", label: "EN" },
  { code: "ar", label: "ع" },
];

export default function Topbar() {
  const { user } = useAuth();
  const { t, i18n } = useTranslation();

  const current = i18n.language?.startsWith("ar") ? "ar" : "en";

  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">{t("admin.panel")}</h1>

      <div className="flex items-center gap-4">
        {/* Language switcher (Arabic / English) */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-200 p-0.5">
          <Globe className="w-4 h-4 text-gray-400 mx-1" />
          {LANGS.map((lang) => (
            <button
              key={lang.code}
              onClick={() => i18n.changeLanguage(lang.code)}
              className={`px-2.5 py-1 text-sm font-semibold rounded-md transition ${
                current === lang.code
                  ? "bg-[#2563EB] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              aria-label={lang.code === "ar" ? "العربية" : "English"}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <span className="text-sm text-gray-600">{user?.email}</span>
        <button className="bg-red-500 text-white px-3 py-1 rounded">
          {t("admin.logout")}
        </button>
      </div>
    </header>
  );
}
