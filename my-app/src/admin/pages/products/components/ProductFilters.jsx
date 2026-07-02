import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../../Shared/services/categoryService";

export default function ProductFilters({ filters, setFilters }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAllCategories();

        const data = res.data;

        // safe fallback
        setCategories(Array.isArray(data) ? data : data?.categories || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="flex gap-4">
      {/* SEARCH */}
      <input
        placeholder={t("admin.common.search")}
        className="border p-2"
        value={filters.keyword || ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            keyword: e.target.value,
          }))
        }
      />

      {/* CATEGORY FILTER */}
      <select
        className="border p-2"
        value={filters.category || ""}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            category: e.target.value,
          }))
        }
      >
        <option value="">{t("admin.products.all_categories")}</option>

        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
}