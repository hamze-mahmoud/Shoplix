import api from "./api";

export const dashboardService = {

  getStats: () => api.get("/dashboard/stats"),

  getSales: () => api.get("/dashboard/sales"),

  getOrders: () => api.get("/dashboard/orders"),

  getRecentOrders: () => api.get("/admin/orders"),

  // Financial & profit reports
  getFinancialSummary: (params) => api.get("/dashboard/financial/summary", { params }),

  getProfitTrend: (params) => api.get("/dashboard/financial/trend", { params }),

  // Advanced analytics
  getCategoryAnalytics: (params) => api.get("/dashboard/analytics/categories", { params }),

  getLowStock: (params) => api.get("/dashboard/analytics/low-stock", { params }),

};