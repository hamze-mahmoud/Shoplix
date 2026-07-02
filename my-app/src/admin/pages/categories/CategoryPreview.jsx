import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../Shared/services/categoryService";
import CategoryNode from "./components/CategoryNode";

export default function CategoryPreview() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [category, setCategory] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategory();
    fetchChildren();
  }, [id]);

  // 🔥 GET CATEGORY INFO
  const fetchCategory = async () => {
    try {
      setLoading(true);

      const res = await categoryService.getChildCategories(id);
      setCategory(res.data);
    } catch (err) {
      setError(t("admin.categories.load_error"));
    } finally {
      setLoading(false);
    }
  };

  // 🔥 GET CHILD CATEGORIES
  const fetchChildren = async () => {
    try {
      const res = await categoryService.getChildCategories(id);
      setChildren(res.data || []);
    } catch (err) {
      console.error("Failed to load children", err);
    }
  };

  if (loading) {
    return <div className="p-6">{t("admin.categories.loading")}</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="p-6 space-y-6">

      {/* 🔹 CATEGORY HEADER */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h1 className="text-2xl font-bold">{category?.name}</h1>

        <p className="text-gray-600 mt-1">
          {category?.description || t("admin.categories.no_description")}
        </p>

        {category?.parent && (
          <p className="text-sm text-gray-500 mt-2">
            {t("admin.categories.parent_id")}: {category.parent}
          </p>
        )}
      </div>

      {/* 🔥 CHILDREN SECTION */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-3">
          {t("admin.categories.child_categories", { count: children.length })}
        </h2>

        {children.length === 0 ? (
          <p className="text-gray-500">{t("admin.categories.no_children")}</p>
        ) : (
          <div className="space-y-2">
            {children.map((child) => (
              <div
                key={child._id}
                className="p-2 border rounded-lg hover:bg-gray-50"
              >
                <CategoryNode node={child} />
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}