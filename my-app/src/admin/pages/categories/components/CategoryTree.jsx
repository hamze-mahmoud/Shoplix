import { useTranslation } from "react-i18next";
import { useCategories } from "../../../../Shared/hooks/useCategories";
import { buildCategoryTree } from "../../../../Shared/utils/buildCategoryTree";
import CategoryNode from "./CategoryNode";

export default function CategoryTree() {
  const { t } = useTranslation();
  const { data: categories = [], loading } = useCategories();

  if (loading) return <p>{t("admin.common.loading")}</p>;

  const tree = buildCategoryTree(categories);

  return (
    <div className="space-y-2">
      {tree.map((node) => (
        <CategoryNode key={node._id} node={node} />
      ))}
    </div>
  );
}