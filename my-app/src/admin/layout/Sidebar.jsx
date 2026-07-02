import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { menu } from "./menu";

export default function Sidebar() {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <aside className="w-72 min-h-screen bg-white border-r border-gray-200 p-5">

      {/* Logo */}
      <div className="mb-10">
        <h2 className="text-2xl font-black bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent">
          {t("admin.brand")}
        </h2>
      </div>

      {/* Menu */}
      <nav className="space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;

          const active =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group ${
                active
                  ? "bg-[#2563EB] text-white shadow-lg shadow-blue-200"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >

              <div className="flex items-center gap-3">

                <Icon
                  className={`w-5 h-5 ${
                    active
                      ? "text-white"
                      : "text-gray-500 group-hover:text-black"
                  }`}
                />

                <span className="font-medium">
                  {t(item.i18nKey, item.name)}
                </span>
              </div>

              {/* Badge */}
              {item.badge && (
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}