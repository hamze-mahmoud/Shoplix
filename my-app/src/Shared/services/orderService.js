import apiClient from "./api";

export const orderService = {
  createOrder: (data) =>
    apiClient.post("/orders", data),

  // Customer's own orders ("My Orders" page) — scoped to the logged-in user
  getMyOrders: () =>
    apiClient.get("/orders"),

  // Admin-only: every order across all customers
  getAllOrders: () =>
    apiClient.get("/admin/orders"),


  getOrderById: (id) =>
    apiClient.get(`/orders/${id}`),


  cancelOrder: (id) =>
    apiClient.delete(`/orders/${id}`),


  updateOrderStatus:(id,status)=>{
    apiClient.put(`/admin/orders/${id}/status`, {
    status: status,
  });
  },

  exportOrdersPdf: (from, to, status) =>
    apiClient.get("/admin/orders/export/pdf", {
      params: { from, to, ...(status ? { status } : {}) },
      responseType: "blob",
    }),
};