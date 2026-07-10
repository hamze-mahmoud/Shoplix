import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../../Shared/services/categoryService";
import { localized } from "../../../../Shared/utils/localize";

export default function CategoryBreadcrumb({ category }) {
  const { t, i18n } = useTranslation();
  const [trail, setTrail] = useState([]);

  useEffect(() => {
    if (!category?._id) return;
    categoryService
      .getCategoryBreadcrumb(category._id)
      .then((res) => setTrail(res.data || []))
      .catch(() =>
        setTrail([{ _id: category._id, name: category.name, translations: category.translations }])
      );
  }, [category?._id]);

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
      <Link to="/" className="flex items-center gap-1 hover:text-green-600 transition">
        <Home className="w-3.5 h-3.5" />
      </Link>
      <ChevronRight className="w-3.5 h-3.5 shrink-0 rtl:rotate-180" />
      <Link to="/categories" className="hover:text-green-600 transition">
        {t("categories.title")}
      </Link>
      {trail.map((c, i) => (
        <span key={c._id} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 shrink-0 rtl:rotate-180" />
          {i === trail.length - 1 ? (
            <span className="text-gray-900 font-medium">{localized(c, "name", i18n.language) || c.name}</span>
          ) : (
            <Link to={`/categories/${c._id}`} className="hover:text-green-600 transition">
              {localized(c, "name", i18n.language) || c.name}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
