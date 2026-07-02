import { useState, useMemo } from "react";

export function usePagination(data = [], itemsPerPage = 5, initialPage = 1) {
  const [page, setPage] = useState(initialPage);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  }, [data, page, itemsPerPage]);

  const nextPage = () => {
    setPage((p) => Math.min(p + 1, totalPages));
  };

  const prevPage = () => {
    setPage((p) => Math.max(p - 1, 1));
  };

  const setCurrentPage = (num) => {
    setPage(Math.max(1, Math.min(num, totalPages)));
  };

  return {
    currentData,
    currentPage: page,
    totalPages,
    nextPage,
    prevPage,
    setCurrentPage,
  };
}