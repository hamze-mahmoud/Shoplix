import { useState } from "react";

export function useProductFilters() {
  const [filters, setFilters] = useState({
    keyword: "",
    category: "",
    color: "",
    minPrice: "",
    maxPrice: "",
  });

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: "",
      category: "",
      color: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
}