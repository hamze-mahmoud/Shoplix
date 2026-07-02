import { useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Download } from "lucide-react";

import SelectField from "../../components/forms/SelectField";
import OrderTable from "./components/OrderTable";
import Button from "../../components/ui/Button";

import { orderService } from "../../../Shared/services/orderService";
import { usePagination } from "../../../Shared/hooks/usePagination";

const initialState = {
  orders: [],
  loading: false,
  error: null,
  statusFilter: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, loading: true, error: null };

    case "SET_ORDERS":
      return { ...state, loading: false, orders: action.payload };

    case "ERROR":
      return { ...state, loading: false, error: action.payload };

    case "SET_FILTER":
      return { ...state, statusFilter: action.payload };

    case "UPDATE_STATUS":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o._id === action.id ? { ...o, status: action.status } : o
        ),
      };

    default:
      return state;
  }
}

export default function OrdersList() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
  async function fetchOrders() {
    dispatch({ type: "START" });

    try {
      const res = await orderService.getAllOrders();

      console.log("Orders response:", res);

      const orders = res?.data?.data || [];
       console.log("oreders",orders)
      dispatch({
        type: "SET_ORDERS",
        payload: orders,
      });
    } catch (err) {
      dispatch({
        type: "ERROR",
        payload: err.response?.data?.message || err.message,
      });
    }
  }

  fetchOrders();
}, []);

  // 🔥 FILTER
  const filteredOrders = state.statusFilter
    ? state.orders.filter((o) => o.status === state.statusFilter)
    : state.orders;

  // 🔥 PAGINATION
  const {
    currentData,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    setCurrentPage,
  } = usePagination(filteredOrders, 5); // 5 orders per page

  const handleStatusChange = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, status);

      dispatch({ type: "UPDATE_STATUS", id, status });
    } catch {
      alert("Failed to update status");
    }
  };

  const handleExportPdf = async () => {
    if (!fromDate || !toDate) {
      setExportError(t("admin.orders.err_select_dates"));
      return;
    }
    if (fromDate > toDate) {
      setExportError(t("admin.orders.err_date_order"));
      return;
    }

    setExportError(null);
    setExporting(true);

    try {
      const res = await orderService.exportOrdersPdf(fromDate, toDate, exportStatus);

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `orders_${fromDate}_to_${toDate}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setExportError(err.response?.data?.message || t("admin.orders.err_export"));
    } finally {
      setExporting(false);
    }
  };

  if (state.loading) return <p className="p-6">{t("admin.common.loading")}</p>;
  if (state.error) return <p className="text-red-500 p-6">{state.error}</p>;

  return (
    <div className="space-y-6 p-6">

      {/* EXPORT TO PDF — download orders within a date range */}
      <div className="bg-white border border-[#111827]/10 rounded-2xl p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#111827]/50 mb-1.5">
            {t("admin.orders.from")}
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-[#111827]/15 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#111827]/50 mb-1.5">
            {t("admin.orders.to")}
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-[#111827]/15 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#111827]/50 mb-1.5">
            {t("admin.orders.order_status")}
          </label>
          <select
            value={exportStatus}
            onChange={(e) => setExportStatus(e.target.value)}
            className="border border-[#111827]/15 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="">{t("admin.orders.all_statuses")}</option>
            <option value="placed">{t("orders.status_placed", "Placed")}</option>
            <option value="confirmed">{t("orders.status_confirmed", "Confirmed")}</option>
            <option value="preparing">{t("orders.status_preparing", "Preparing")}</option>
            <option value="shipped">{t("orders.status_shipped", "Shipped")}</option>
            <option value="out_for_delivery">{t("orders.status_out_for_delivery", "Out for Delivery")}</option>
            <option value="delivered">{t("orders.status_delivered", "Delivered")}</option>
            <option value="cancelled">{t("orders.status_cancelled", "Cancelled")}</option>
          </select>
        </div>

        <button
          onClick={handleExportPdf}
          disabled={exporting}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-green-500 text-[#111827] font-bold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {exporting ? t("admin.orders.generating") : t("admin.orders.download_pdf")}
        </button>

        {exportError && (
          <p className="text-sm text-red-500 basis-full">{exportError}</p>
        )}
      </div>

      {/* FILTER */}
      <SelectField
        label={t("admin.orders.filter_by_status")}
        name="status"
        value={state.statusFilter}
        onChange={(e) => {
          dispatch({ type: "SET_FILTER", payload: e.target.value });
          setCurrentPage(1); // reset page on filter change
        }}
        options={[
          { label: t("admin.orders.status.all"), value: "" },
          { label: t("admin.orders.status.pending"), value: "pending" },
          { label: t("admin.orders.status.paid"), value: "paid" },
          { label: t("admin.orders.status.shipped"), value: "shipped" },
          { label: t("admin.orders.status.delivered"), value: "delivered" },
        ]}
      />

      {/* TABLE */}
      <OrderTable
  orders={currentData}
  onStatusChange={handleStatusChange}
  dispatch={dispatch}
/>

      {/* 🔥 PAGINATION CONTROLS */}
      <div className="flex justify-center items-center gap-4">

        <Button
          onClick={prevPage}
          disabled={currentPage === 1}
        >
          {t("admin.common.prev")}
        </Button>

        <span className="font-semibold">
          {t("admin.common.page_of", { page: currentPage, total: totalPages || 1 })}
        </span>

        <Button
          onClick={nextPage}
          disabled={currentPage === totalPages}
        >
          {t("admin.common.next")}
        </Button>

      </div>

    </div>
  );
}