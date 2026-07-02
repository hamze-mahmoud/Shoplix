import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Breadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();
  const paths = location.pathname.split("/").filter(Boolean);

  return (
    <div className="text-sm text-gray-500 mb-4">
      {paths.map((p, i) => (
        <span key={i}>
          {t(`admin.breadcrumb.${p}`, p)} {i < paths.length - 1 && " / "}
        </span>
      ))}
    </div>
  );
}