import api from "./api";

export const bannerService = {
  // Public — active homepage slides
  getBanners: () => api.get("/banners"),

  // ---- Admin management ----
  adminGetBanners: () => api.get("/admin/banners"),

  // `data` is a FormData (image file + translations JSON + link/order/active)
  createBanner: (data) =>
    api.post("/admin/banners", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateBanner: (id, data) =>
    api.put(`/admin/banners/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteBanner: (id) => api.delete(`/admin/banners/${id}`),
};
