import { useState } from "react";
import { toastService } from "../../../../Shared/services/toastService";
import { useTranslation } from "react-i18next";
import OrderDetailsModal from "./OrderDetailsModal";
import { orderService } from "../../../../Shared/services/orderService";

const statusStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrderTable({ orders, onStatusChange }) {
  const { t } = useTranslation();
  const [loadingId, setLoadingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleChange = async (id, status) => {
  try {
    setLoadingId(id);

    await onStatusChange(id, status); // ✅ only this

    toastService.success(t("admin.orders.updated_to", { status: t(`orders.status_${status}`, status) }));
  } catch (err) {
    toastService.error(t("admin.orders.update_failed"));
  } finally {
    setLoadingId(null);
  }
};

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

      {/* HEADER */}
      <div className="p-4 flex justify-between items-center bg-gray-50 border-b">
        <h2 className="font-semibold text-gray-700">
          {t("admin.orders.management")}
        </h2>

        <span className="text-sm text-gray-500">
          {t("admin.orders.total_count", { count: orders.length })}
        </span>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">

          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">{t("admin.orders.col_order")}</th>
              <th className="p-3 text-left">{t("admin.orders.col_customer")}</th>
              <th className="p-3 text-left">{t("admin.orders.col_date")}</th>
              <th className="p-3 text-left">{t("admin.orders.col_total")}</th>
              <th className="p-3 text-left">{t("admin.orders.col_status")}</th>
              <th className="p-3 text-left">{t("admin.orders.col_action")}</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">

            {orders.map((o) => (
              <tr
                key={o._id}
                className="hover:bg-gray-50 transition"
              >

                {/* ORDER ID */}
                <td
                  className="p-3 text-blue-600 font-medium cursor-pointer hover:underline"
                  onClick={() => setSelectedOrder(o)}
                >
                  #{o._id.slice(-6)}
                </td>

                {/* USER */}
                <td className="p-3">
                  <div className="font-medium">
                    {o.user?.firstName} {o.user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {o.user?.email}
                  </div>
                </td>

                {/* DATE */}
                <td className="p-3 text-gray-600 whitespace-nowrap">
                  {new Date(o.createdAt).toLocaleDateString()}
                  <div className="text-xs text-gray-400">
                    {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </td>

                {/* TOTAL */}
                <td className="p-3 font-semibold text-gray-800">
                  ${o.totalPrice}
                </td>

                {/* STATUS */}
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusStyles[o.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t(`orders.status_${o.status}`, o.status)}
                  </span>
                </td>

                {/* ACTION */}
                <td className="p-3 flex items-center gap-2">

                  <select
                    value={o.status}
                    disabled={loadingId === o._id}
                    onChange={(e) =>
                      handleChange(o._id, e.target.value)
                    }
                    className="
                      border border-gray-200 rounded-lg px-2 py-1
                      text-sm focus:ring-2 focus:ring-blue-400
                      disabled:opacity-50
                    "
                  >
                    <option value="pending">{t("admin.orders.status.pending")}</option>
                    <option value="paid">{t("admin.orders.status.paid")}</option>
                    <option value="shipped">{t("admin.orders.status.shipped")}</option>
                    <option value="delivered">{t("admin.orders.status.delivered")}</option>
                    <option value="cancelled">{t("admin.orders.status.cancelled")}</option>
                  </select>

                  {loadingId === o._id && (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EMPTY STATE */}
      {orders.length === 0 && (
        <div className="p-10 text-center text-gray-500">
          {t("admin.orders.empty")}
        </div>
      )}

      {/* MODAL */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}