import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { categoryService } from "../../../../Shared/services/categoryService";

export default function CategoryPathSelector({
  value,
  onChange,
}) {
  const { t } = useTranslation();
  const [levels, setLevels] = useState([]);
  const [selectedPath, setSelectedPath] = useState([]);

  // 🔥 LOAD ROOT CATEGORIES
  useEffect(() => {
    loadRootCategories();
  }, []);

  const loadRootCategories = async () => {
    try {
      const res = await categoryService.getRootCategories();

      const roots = res.data || [];

      setLevels([
        {
          parentId: null,
          categories: roots,
        },
      ]);
    } catch (err) {
      console.error("Failed to load root categories", err);
    }
  };

  // 🔥 HANDLE SELECT CATEGORY
  const handleSelect = async (levelIndex, categoryId) => {
    try {
      // remove deeper levels
      const updatedLevels = levels.slice(0, levelIndex + 1);

      // update selected path
      const updatedPath = selectedPath.slice(0, levelIndex);

      const selectedCategory =
        levels[levelIndex].categories.find(
          (c) => c._id === categoryId
        );

      updatedPath[levelIndex] = selectedCategory;

      setSelectedPath(updatedPath);

      // fetch children
      const res =
        await categoryService.getChildCategories(categoryId);

      const children = res.data || [];

      // if has children → add new level
      if (children.length > 0) {
        updatedLevels.push({
          parentId: categoryId,
          categories: children,
        });

        setLevels(updatedLevels);

        // 🔥 NOT FINAL CATEGORY
        onChange("");
      } else {
        // 🔥 FINAL LEAF CATEGORY
        setLevels(updatedLevels);

        onChange(categoryId);
      }
    } catch (err) {
      console.error("Failed to load child categories", err);
    }
  };

  return (
    <div className="space-y-4">

      {/* 🔥 CATEGORY PATH */}
      {selectedPath.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          {selectedPath.map((item, i) => (
            <div
              key={item._id}
              className="flex items-center gap-2"
            >
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {item.name}
              </span>

              {i !== selectedPath.length - 1 && (
                <span className="text-gray-400">→</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 🔥 LEVEL SELECTORS */}
      <div className="space-y-3">
        {levels.map((level, levelIndex) => (
          <select
            key={levelIndex}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={
              selectedPath[levelIndex]?._id || ""
            }
            onChange={(e) =>
              handleSelect(levelIndex, e.target.value)
            }
          >
            <option value="">
              {t("admin.categories.select_category")}
            </option>

            {level.categories.map((category) => (
              <option
                key={category._id}
                value={category._id}
              >
                {category.name}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* 🔥 FINAL CATEGORY */}
      {value && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
          {t("admin.categories.final_selected")}
        </div>
      )}
    </div>
  );
}