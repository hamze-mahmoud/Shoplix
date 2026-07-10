import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";
import { toastService } from "../services/toastService";

import { notificationService } from "../services/notificationService";
import { getSocket, joinUserRoom } from "../services/socket";
import { getAccessToken } from "../services/api";

const NotificationContext = createContext(null);

// Reads the in-memory access token (never client storage — see api.js).
function getUserIdFromToken() {
  const token = getAccessToken();
  if (!token) return null;
  try {
    return jwtDecode(token).id || null;
  } catch {
    return null;
  }
}

export function NotificationProvider({ children }) {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const seenRef = useRef(new Set()); // de-dupe live pushes by notification id

  // Initial fetch (only when logged in)
  const fetchNotifications = useCallback(async () => {
    if (!getUserIdFromToken()) return;
    setLoading(true);
    try {
      const { data } = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch once on mount (when logged in)
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time socket subscription. Subscribe/cleanup is symmetric so it stays
  // live under React StrictMode's double-invoke in development.
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) return;

    joinUserRoom(userId);
    const socket = getSocket();

    const handler = (notification) => {
      // De-dupe (handles StrictMode + multiple socket connections) BEFORE any
      // side effect, so toast/count run exactly once per notification.
      if (seenRef.current.has(notification._id)) return;
      seenRef.current.add(notification._id);

      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);

      const msg = notification.messageKey
        ? t(notification.messageKey, notification.params || {})
        : notification.message;
      toastService.notify(msg);
    };

    socket.on("new_notification", handler);
    return () => socket.off("new_notification", handler);
  }, [t]);

  const markAsRead = useCallback(async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error("markAsRead failed", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error("markAllAsRead failed", err);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    // Safe fallback if used outside the provider
    return {
      notifications: [],
      unreadCount: 0,
      loading: false,
      fetchNotifications: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
    };
  }
  return ctx;
}
