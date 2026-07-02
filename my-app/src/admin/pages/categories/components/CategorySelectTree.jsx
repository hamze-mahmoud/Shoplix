import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export default function CategorySelectTree({
  categories = [],
  value = "",
  onChange,
  onCreateCategory,
}) {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // Build category tree
  const treeCategories = useMemo(() => {
    const buildTree = (
      parent = null,
      level = 0
    ) => {
      let result = [];

      categories
        .filter(
          (cat) => cat.parent === parent
        )
        .forEach((cat) => {
          result.push({
            ...cat,
            level,
          });

          result = [
            ...result,
            ...buildTree(
              cat._id,
              level + 1
            ),
          ];
        });

      return result;
    };

    return buildTree();
  }, [categories]);

  // Add new parent category
  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
             console.log("new category",newCategory)
    const categoryData = {
      _id: Date.now().toString(),
      name: newCategory,
      parent: null,
    };
console.log("categoryData",categoryData)
    // Send category to parent component
    onCreateCategory(categoryData);

    // Reset
    setNewCategory("");
    setShowForm(false);
  };

  return (
    <div className="w-full space-y-3">
      {/* Select Category */}
      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="w-full border border-gray-300 rounded-2xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="">
          {t("admin.categories.no_parent")}
        </option>

        {treeCategories.map((cat) => (
          <option
            key={cat._id}
            value={cat._id}
          >
            {"— ".repeat(cat.level)}
            {cat.name}
          </option>
        ))}
      </select>

      {/* Toggle Add Parent */}
      <button
        type="button"
        onClick={() =>
          setShowForm(!showForm)
        }
        className="text-green-600 text-sm font-medium hover:text-green-700"
      >
        {showForm
          ? t("admin.common.cancel")
          : `+ ${t("admin.categories.add_parent")}`}
      </button>

      {/* Add Parent Form */}
      {showForm && (
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={t("admin.categories.parent_name_placeholder")}
            value={newCategory}
            onChange={(e) =>
              setNewCategory(
                e.target.value
              )
            }
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-green-500"
          />

          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-green-600 text-white px-5 py-2 rounded-xl hover:bg-green-700 transition"
          >
            {t("admin.common.add")}
          </button>
        </div>
      )}
    </div>
  );
}