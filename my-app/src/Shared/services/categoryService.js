import api from "./api";

export const categoryService = {
  // 🔹 BASIC
    getCategoryWithProducts:(id)=>
    api.get(`/categories/${id}/products`),
  getAllCategories: () =>
    api.get("/categories"),

  getCategoryById: (id) =>
    api.get(`/categories/${id}`),

  // 🔹 TREE / STRUCTURE
  getCategoryTree: () =>
    api.get("/categories/tree/all"),

  getRootCategories: () =>
    api.get("/categories/root/all"),

  // Flat list of all categories with resolved images (parent inherits from child)
  getCategoriesShowcase: () =>
    api.get("/categories/showcase/all"),

  getChildCategories: (parentId) =>
    api.get(`/categories/${parentId}/children`),

  getCategoryBreadcrumb: (id) =>
    api.get(`/categories/${id}/breadcrumb`),

  // 🔹 CRUD (Admin / Dashboard)
  createCategory: (data) =>
    api.post("/categories", data),

  updateCategory: (id, data) =>
    api.put(`/categories/${id}`, data),

  deleteCategory: (id) =>
    api.delete(`/categories/${id}`),

  


  // 🔹 SEARCH
  searchCategories: (query) =>
    api.get("/categories/search/query", {
      params: { q: query },
    }),
};