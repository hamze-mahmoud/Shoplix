import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Package,
  CheckCircle2,
  Truck,
  Bike,
  PackageCheck,
  XCircle,
  Bell,
  Flame,
} from "lucide-react";

import { timeAgo } from "../../utils/timeAgo";

// Icon + colour per order event
const EVENT_STYLE = {
  placed: { icon: Package, color: "text-gray-600", bg: "bg-gray-100" },
  confirmed: { icon: CheckCircle2, color: "text-yellow-600", bg: "bg-yellow-50" },
  preparing: { icon: Package, color: "text-yellow-700", bg: "bg-yellow-100" },
  shipped: { icon: Truck, color: "text-green-600", bg: "bg-green-50" },
  out_for_delivery: { icon: Bike, color: "text-green-700", bg: "bg-green-100" },
  delivered: { icon: PackageCheck, color: "text-green-600", bg: "bg-green-50" },
  cancelled: { icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  new_offer: { icon: Flame, color: "text-amber-600", bg: "bg-amber-50" },
};

export default function NotificationItem({ notification, onClick }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const style = EVENT_STYLE[notification.event] || {
    icon: Bell,
    color: "text-gray-600",
    bg: "bg-gray-100",
  };
  const Icon = style.icon;

  // Broadcast promos carry per-language titles in params.titles — pick the
  // viewer's language so the offer name renders localized, not canonical.
  const params = { ...(notification.params || {}) };
  const lang = (i18n.language || "en").slice(0, 2);
  if (params.titles) params.title = params.titles[lang] || params.title;

  const title = notification.titleKey
    ? t(notification.titleKey, params)
    : notification.title;
  const message = notification.messageKey
    ? t(notification.messageKey, params)
    : notification.message;

  const handleClick = () => {
    onClick?.(notification);
    if (notification.order) navigate(`/orders/${notification.order}`);
    else if (params.offerId) navigate(`/offers/${params.offerId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-start transition hover:bg-gray-50 ${
        notification.read ? "bg-white" : "bg-green-50/40"
      }`}
    >
      {/* Icon */}
      <div className={`mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.bg}`}>
        <Icon className={`w-5 h-5 ${style.color}`} />
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm truncate ${notification.read ? "font-medium text-gray-800" : "font-bold text-gray-900"}`}>
            {title}
          </p>
          {!notification.read && (
            <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{message}</p>
        <p className="text-[11px] text-gray-400 mt-1">
          {timeAgo(notification.createdAt, i18n.language)}
        </p>
      </div>
    </button>
  );
}
