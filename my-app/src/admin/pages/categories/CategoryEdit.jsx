import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCategories } from "../../../Shared/hooks/useCategories";
import CategoryForm from "./components/CategoryForm";
import { categoryService } from "../../../Shared/services/categoryService";

export default function CategoryEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: categories = [] } = useCategories();

  const category = categories.find((c) => c._id === id);

  const handleUpdate = async (data) => {
    await categoryService.updateCategory(id, data);
    navigate("/admin/categories");
  };

  if (!category) return <p>{t("admin.common.loading")}</p>;

  return (
    <CategoryForm
      initialData={category}
      onSubmit={handleUpdate}
    />
  );
}