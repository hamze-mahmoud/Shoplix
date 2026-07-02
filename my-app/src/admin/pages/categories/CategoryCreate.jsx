import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import CategoryForm from "./components/CategoryForm";

import { categoryService } from "../../../Shared/services/categoryService";

export default function CategoryCreate() {

  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    try {

      setLoading(true);
      await categoryService.createCategory(formData);

      navigate("/admin/categories");

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">

      <div className="mb-8">

        <h1 className="text-3xl font-black text-gray-900">
          {t("admin.categories.create")}
        </h1>

        <p className="text-gray-500 mt-2">
          {t("admin.categories.create_sub")}
        </p>
      </div>

      <CategoryForm
        onSubmit={handleSubmit}
        loading={loading}
      />
    </div>
  );
}