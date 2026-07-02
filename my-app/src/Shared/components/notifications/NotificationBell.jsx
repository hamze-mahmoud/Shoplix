import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Bell, CheckCheck, BellOff } from "lucide-react";

import { useNotifications } from "../../context/NotificationContext";
import NotificationItem from "./NotificationItem";

export default function NotificationBell() {
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const bellRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* BELL BUTTON */}
      <button
        ref={bellRef}
        onClick={() => setOpen((o) => !o)}
        className="group relative inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-green-50 active:scale-90 transition-all duration-200"
        aria-label={t("notifications.title")}
      >
        <Bell className={`w-5 h-5 text-[#111827] group-hover:text-green-600 transition-colors ${unreadCount > 0 ? "animate-[wiggle_0.5s_ease-in-out]" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 end-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute end-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-slide-down">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900">{t("notifications.title")}</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  {t("notifications.unread_count", { count: unreadCount })}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-green-600 transition"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("notifications.mark_all_read")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[24rem] overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <BellOff className="w-7 h-7 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-700">{t("notifications.empty")}</p>
                <p className="text-xs text-gray-400 mt-1">{t("notifications.empty_desc")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  notification={n}
                  onClick={(notif) => {
                    if (!notif.read) markAsRead(notif._id);
                    setOpen(false);
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
