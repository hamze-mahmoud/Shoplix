import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
  FolderTree,
  Plus,
  Search,
  RefreshCcw,
} from "lucide-react";

import CategoryTree from "./components/CategoryTree";

import { categoryService } from "../../../Shared/services/categoryService";

export default function CategoriesList() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  // 🔥 Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);

      const { data } =
        await categoryService.getCategoryTree();

      setCategories(
        data.categories || data || []
      );

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔥 Filter search
  const filteredCategories = categories.filter((cat) =>
    cat.name
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* 🔥 HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-black text-gray-900">
            {t("admin.nav.categories")}
          </h1>

          <p className="text-gray-500 mt-1">
            {t("admin.categories.subtitle")}
          </p>
        </div>

        <div className="flex items-center gap-3">

          {/* Refresh */}
          <button
            onClick={fetchCategories}
            className="p-3 rounded-2xl border border-gray-200 hover:bg-gray-100 transition"
          >
            <RefreshCcw className="w-5 h-5 text-gray-600" />
          </button>

          {/* Create */}
          <Link
            to="/admin/categories/create"
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg transition"
          >
            <Plus className="w-5 h-5" />

            {t("admin.categories.create")}
          </Link>
        </div>
      </div>

      {/* 🔥 SEARCH */}
      <div className="relative">

        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

        <input
          type="text"
          placeholder={t("admin.categories.search")}
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      {/* 🔥 CONTENT */}
      <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">

            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />

            <p className="text-gray-500 mt-4">
              {t("admin.categories.loading")}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading &&
          filteredCategories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">

              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">

                <FolderTree className="w-12 h-12 text-green-600" />
              </div>

              <h2 className="mt-6 text-2xl font-bold text-gray-800">
                {t("admin.categories.empty_title")}
              </h2>

              <p className="text-gray-500 mt-2 max-w-md">
                {t("admin.categories.empty_sub")}
              </p>

              <Link
                to="/admin/categories/create"
                className="mt-6 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-2xl font-semibold transition"
              >
                {t("admin.categories.create_first")}
              </Link>
            </div>
          )}

        {/* Categories Tree */}
        {!loading &&
          filteredCategories.length > 0 && (
            <div className="p-6">
        
              <CategoryTree
                categories={filteredCategories}
                onRefresh={fetchCategories}
              />

            </div>
          )}
      </div>
    </div>
  );
}