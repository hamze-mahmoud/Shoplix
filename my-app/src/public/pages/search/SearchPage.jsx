import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchX } from "lucide-react";
import { searchService } from "../../../Shared/services/searchService";
import ProductGrid from "../products/components/listing/ProductGrid";

export default function SearchPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const query = params.get("q");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await searchService.searchProducts({ keyword: query });
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };

    if (query) fetchData();
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10 sm:py-14">
        <p className="text-xs uppercase tracking-[0.25em] text-[#16A34A] font-semibold mb-3">
          {t("products.browse")}
        </p>
        <h1 className="font-display text-3xl sm:text-4xl text-[#111827] mb-8">
          {t("products.results_for", { query })}
          {!loading && (
            <span className="ms-2 text-base font-sans text-[#111827]/40">
              {t("products.count", { count: products.length })}
            </span>
          )}
        </h1>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-52 bg-[#F1F3F5] rounded-2xl mb-3" />
                <div className="h-3 w-2/3 bg-[#F1F3F5] rounded mb-2" />
                <div className="h-3 w-1/3 bg-[#F1F3F5] rounded" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#111827] text-white flex items-center justify-center mb-5">
              <SearchX className="w-7 h-7" />
            </div>
            <h2 className="font-display text-2xl text-[#111827]">{t("products.no_products")}</h2>
            <p className="mt-2 text-[#111827]/55 max-w-sm">{t("products.no_products_desc")}</p>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </div>
    </div>
  );
}