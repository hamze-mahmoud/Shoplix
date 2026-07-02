import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";

export default function ProductFilters({
  category,
  setCategory,
  sort,
  setSort,
  categories = [],
}) {
  const { t } = useTranslation();

  const sortOptions = [
    { value: "newest", label: t("products.sort_newest") },
    { value: "price_low", label: t("products.sort_price_low") },
    { value: "price_high", label: t("products.sort_price_high") },
  ];

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between border-y border-[#111827]/10 py-5">
      {/* CATEGORY PILLS */}
      <div className="flex items-center gap-6 overflow-x-auto -mx-1 px-1 no-scrollbar">
        <button
          onClick={() => setCategory("")}
          className={`shrink-0 text-xs uppercase tracking-[0.18em] pb-1 border-b transition-colors ${
            !category
              ? "text-[#111827] border-[#111827]"
              : "text-[#111827]/45 border-transparent hover:text-[#111827]"
          }`}
        >
          {t("products.all_categories")}
        </button>

        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setCategory(c._id)}
            className={`shrink-0 text-xs uppercase tracking-[0.18em] pb-1 border-b transition-colors ${
              category === c._id
                ? "text-[#111827] border-[#111827]"
                : "text-[#111827]/45 border-transparent hover:text-[#111827]"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* SORT */}
      <div className="relative shrink-0">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="appearance-none bg-transparent text-xs uppercase tracking-[0.18em] text-[#111827] ps-1 pe-8 py-1 border-b border-[#111827]/30 focus:border-[#111827] outline-none cursor-pointer"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 absolute end-1 top-1/2 -translate-y-1/2 pointer-events-none text-[#111827]/50" />
      </div>
    </div>
  );
}
