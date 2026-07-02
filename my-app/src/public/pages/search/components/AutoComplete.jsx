import { Loader2, SearchX, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import SearchResults from "./SearchResults";

export default function AutoComplete({ open, loading, results, query, activeIndex, onSelect, onSearch }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="absolute top-full start-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-down">

      {loading && (
        <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("common.loading")}
        </div>
      )}

      {!loading && results.length > 0 && (
        <SearchResults results={results} activeIndex={activeIndex} onSelect={onSelect} />
      )}

      {!loading && results.length === 0 && (
        <div className="flex items-center gap-2 p-4 text-sm text-gray-500">
          <SearchX className="w-4 h-4" />
          {t("products.no_products")}
        </div>
      )}

      {!loading && results.length > 0 && (
        <button
          onClick={onSearch}
          className="w-full flex items-center justify-center gap-2 text-sm py-3 border-t border-gray-100 hover:bg-gray-50 cursor-pointer font-medium text-green-600 transition"
        >
          View all results for &ldquo;{query}&rdquo;
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
