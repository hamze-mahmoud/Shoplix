import apiClient from "./api";

export const reviewService = {
  getProductReviews: (productId) =>
    apiClient.get(`/reviews/product/${productId}`),

  getEligibility: (productId) =>
    apiClient.get(`/reviews/eligibility/${productId}`),

  createReview: (product, rating, comment) =>
    apiClient.post("/reviews", { product, rating, comment }),

  updateReview: (id, rating, comment) =>
    apiClient.put(`/reviews/${id}`, { rating, comment }),

  deleteReview: (id) =>
    apiClient.delete(`/reviews/${id}`),

  // ---- Admin moderation ----
  adminGetReviews: (status = "pending") =>
    apiClient.get("/admin/reviews", { params: { status } }),

  adminSetStatus: (id, status) =>
    apiClient.patch(`/admin/reviews/${id}/status`, { status }),
};
