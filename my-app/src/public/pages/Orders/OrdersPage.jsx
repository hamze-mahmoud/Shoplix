import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, ShoppingBag } from "lucide-react";

import { orderService } from "../../../Shared/services/orderService";
import OrderCard from "./components/OrderCard";

function OrderSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-3xl border border-gray-100 p-5 animate-pulse space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-1/6" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-1/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

        {/* HEADER */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center">
            <Package className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{t("orders.title")}</h1>
            <p className="text-sm text-gray-500">{t("orders.subtitle")}</p>
          </div>
        </div>

        {loading ? (
          <OrderSkeleton />
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <ShoppingBag className="w-14 h-14 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">{t("orders.empty")}</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">{t("orders.empty_desc")}</p>
            <Link
              to="/products"
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-[#16A34A] text-white rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition"
            >
              {t("orders.shop_now")}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
