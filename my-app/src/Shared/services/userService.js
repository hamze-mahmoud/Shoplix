import apiClient from "./api";

export const userService = {
  // Admin: enriched users (order count + total spent), top customers first
  getAllUsers: () => apiClient.get("/admin/users"),

  getUserById: (id) => apiClient.get(`/users/${id}`),

  createUser: (data) => apiClient.post("/users", data),

  updateUser: (id, data) => apiClient.put(`/users/${id}`, data),

  // Admin delete
  deleteUser: (id) => apiClient.delete(`/admin/users/${id}`),

  getCurrentUser: () => apiClient.get("/users/me"),
};