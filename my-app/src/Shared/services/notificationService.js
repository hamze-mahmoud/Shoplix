import api from "./api";

export const notificationService = {
  // GET current user's notifications + unread count
  getNotifications: () => api.get("/notifications"),

  // GET unread count only (lightweight)
  getUnreadCount: () => api.get("/notifications/unread-count"),

  // PATCH mark a single notification as read
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  // PATCH mark all as read
  markAllAsRead: () => api.patch("/notifications/read-all"),
};
