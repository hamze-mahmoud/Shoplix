import api from "./api";

export const offerService = {
  // ---- Public ----
  getOffers: () => api.get("/offers"),
  getOffer: (id) => api.get(`/offers/${id}`),

  // ---- Admin management ----
  adminGetOffers: () => api.get("/admin/offers"),
  adminGetOffer: (id) => api.get(`/admin/offers/${id}`),

  // `data` is FormData (images files + items JSON + fields)
  createOffer: (data) =>
    api.post("/admin/offers", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateOffer: (id, data) =>
    api.put(`/admin/offers/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteOffer: (id) => api.delete(`/admin/offers/${id}`),

  // Server-side paginated product picker (aggregation) for the admin form.
  searchProducts: (q, page = 1, limit = 10) =>
    api.get("/admin/products/search", { params: { q, page, limit } }),
};
