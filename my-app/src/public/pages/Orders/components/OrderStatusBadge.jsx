import { ShoppingBag, CheckCircle2, Package, Truck, Bike, PackageCheck, XCircle, Clock, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";

const CONFIG = {
  placed: { color: "bg-gray-100 text-gray-700 ring-gray-200", icon: ShoppingBag },
  confirmed: { color: "bg-yellow-50 text-yellow-700 ring-yellow-200", icon: CheckCircle2 },
  preparing: { color: "bg-yellow-100 text-yellow-800 ring-yellow-300", icon: Package },
  shipped: { color: "bg-green-50 text-green-700 ring-green-200", icon: Truck },
  out_for_delivery: { color: "bg-green-100 text-green-800 ring-green-300", icon: Bike },
  delivered: { color: "bg-green-200 text-green-900 ring-green-400", icon: PackageCheck },
  cancelled: { color: "bg-red-50 text-red-700 ring-red-200", icon: XCircle },
  // legacy
  pending: { color: "bg-gray-100 text-gray-700 ring-gray-200", icon: Clock },
  paid: { color: "bg-yellow-50 text-yellow-700 ring-yellow-200", icon: CheckCircle2 },
  processing: { color: "bg-yellow-100 text-yellow-800 ring-yellow-300", icon: Loader },
};

export default function OrderStatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = CONFIG[status] || CONFIG.placed;
  const Icon = cfg.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ${cfg.color}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {t(`orders.status_${status}`, status)}
    </span>
  );
}
