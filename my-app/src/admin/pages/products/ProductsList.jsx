// admin/pages/products/ProductsList.jsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDebounce } from "../../../Shared/hooks/useDebounce";
import { useProducts } from "../../../Shared/hooks/useProducts";

import ProductTable from "./components/ProductTable";
import ProductFilters from "./components/ProductFilters";
import ProductTableSkeleton from "./components/ProductTableSkeleton";

export default function ProductsList() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    sort: "-createdAt",
    category: "",
    status: "",
    minPrice: "",
    maxPrice: "",
    featured: "",
    stock: "",
  });

  const debouncedSearch = useDebounce(search, 500);

  const {
    products,
    loading,
    error,
    pagination,
    refetch,
  } = useProducts({
    search: debouncedSearch,
    page,
    limit: 10,
    ...filters,
  });

  function handleFilterChange(name, value) {
    setPage(1);

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-xl shadow-sm">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.nav.products")}</h1>

          <p className="text-gray-500">
            {t("admin.products.subtitle")}
          </p>
        </div>

     <button
  onClick={() => navigate("/admin/products/create")}
  className="px-4 py-2 bg-black text-white rounded-lg"
>
  + {t("admin.products.create")}
</button>
      </div>

      {/* FILTERS */}
      <ProductFilters
        search={search}
        setSearch={setSearch}
        filters={filters}
        onChange={handleFilterChange}
      />

      {/* ERROR */}
      {error && (
        <div className="p-4 rounded-lg bg-red-100 text-red-600">
          <div className="flex items-center justify-between">
            <span>{error}</span>

            <button
              onClick={refetch}
              className="px-3 py-1 bg-red-500 text-white rounded"
            >
              {t("admin.common.retry")}
            </button>
          </div>
        </div>
      )}

      {/* LOADING */}
      {loading && <ProductTableSkeleton />}

      {/* TABLE */}
      {!loading && !error && (
        <>
          <ProductTable products={products} />

          {/* EMPTY */}
          {products.length === 0 && (
            <div className="text-center py-16 border rounded-xl">
              <h3 className="text-lg font-semibold">
                {t("admin.products.empty_title")}
              </h3>

              <p className="text-gray-500 mt-2">
                {t("admin.products.empty_sub")}
              </p>
            </div>
          )}

          {/* PAGINATION */}
          {products.length > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-500">
                {t("admin.common.showing_page", { page: pagination.page, total: pagination.totalPages })}
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() =>
                    setPage((prev) => prev - 1)
                  }
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  {t("admin.common.previous")}
                </button>

                {Array.from({
                  length: pagination.totalPages,
                }).map((_, index) => {
                  const pageNumber = index + 1;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`px-4 py-2 rounded-lg border ${
                        page === pageNumber
                          ? "bg-black text-white"
                          : ""
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  disabled={
                    page === pagination.totalPages
                  }
                  onClick={() =>
                    setPage((prev) => prev + 1)
                  }
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  {t("admin.common.next")}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}