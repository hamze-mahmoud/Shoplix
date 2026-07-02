  import api from "./api";

  export const productService = {
      getAllProducts: (params) =>
    api.get("/products", {
      params, // 🔥 THIS IS THE KEY FIX
    }),

    getProductById: (id) => api.get(`/products/${id}`),

    createProduct: (data) =>
      api.post("/admin/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

      
    getRecommendedProducts: (id) =>
  api.get(
    `/products/${id}/recommendations`
      ),



    updateProduct: (id, data) =>
      api.put(`/admin/products/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      }),

    deleteProduct: (id) => api.delete(`/products/${id}`),


    getProductsByCategory: (categoryId, params = {}) =>
      api.get(`/products/category/${categoryId}`, { params }),
    getFeaturedProducts: () => api.get("/products/featured"),

    getBestSellers: (params) => api.get("/products/bestsellers", { params }),

  };