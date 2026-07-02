import { useEffect, useState } from 'react';
import { productService } from '../services/productService';

export function useProducts(filters) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalProducts: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [JSON.stringify(filters)]);

  async function fetchProducts() {
  try {
    setLoading(true);
    setError(null);

    const res = await productService.getAllProducts(filters);

    const data = res.data;

    console.log("products in useProducts hook", data);

    setProducts(data.products || []);

    setPagination({
      page: data.page || 1,
      limit: filters?.limit || 10,
      totalPages: data.pages || 1,
      totalProducts: data.total || 0,
    });

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
  };
}