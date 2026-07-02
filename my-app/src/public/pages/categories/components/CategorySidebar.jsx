import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LayoutGrid, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../../Shared/services/categoryService";
import { localized } from "../../../../Shared/utils/localize";

export default function CategorySidebar() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService
      .getCategoryTree()
      .then((res) => setCategories(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-3xl border border-black/[0.06] shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] overflow-hidden lg:sticky lg:top-24">

        {/* HEADER — black → green gradient strip */}
        <div className="relative flex items-center gap-3 px-5 py-5 bg-gradient-to-br from-[#111827] to-green-700 overflow-hidden">
          <div className="absolute -top-8 -end-6 w-24 h-24 bg-green-400/20 rounded-full blur-2xl pointer-events-none" />
          <span className="relative z-10 w-10 h-10 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <LayoutGrid className="w-5 h-5 text-white" />
          </span>
          <div className="relative z-10">
            <h2 className="font-display text-lg leading-none text-white">
              {t("categories.all_categories")}
            </h2>
            <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-green-200/80">
              {t("categories.browse")}
            </p>
          </div>
        </div>

        {/* NAV */}
        <div className="p-3">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-11 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            <nav className="space-y-1">
              {categories.map((cat) => {
                const active = cat._id === id;
                return (
                  <Link
                    key={cat._id}
                    to={`/categories/${cat._id}`}
                    aria-current={active ? "page" : undefined}
                    className={`group relative flex items-center gap-3 ps-4 pe-3 py-3 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                      active
                        ? "bg-green-50 text-green-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#111827]"
                    }`}
                  >
                    {/* active accent bar */}
                    <span
                      className={`absolute start-0 inset-y-2 w-1 rounded-full bg-green-600 transition-opacity ${
                        active ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        active
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-[#111827]"
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                    </span>
                    <span className="truncate">{localized(cat, "name", i18n.language)}</span>
                    {active && (
                      <span className="ms-auto w-2 h-2 rounded-full bg-green-500 shrink-0" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>
    </aside>
  );
}
