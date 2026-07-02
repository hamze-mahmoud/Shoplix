import { useParams, useNavigate } from "react-router-dom";
import { useReducer, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { orderService } from "../../../Shared/services/orderService";
import Button from "../../components/ui/Button";

const initialState = {
  order: null,
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return { ...state, loading: true };

    case "SUCCESS":
      return { ...state, loading: false, order: action.payload };

    case "ERROR":
      return { ...state, loading: false, error: action.payload };

    case "UPDATE_STATUS":
      return {
        ...state,
        order: { ...state.order, status: action.payload },
      };

    default:
      return state;
  }
}

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    async function fetchOrder() {
      dispatch({ type: "START" });

      try {
        const res = await orderService.getOrderById(id);
        dispatch({ type: "SUCCESS", payload: res.data });
      } catch (err) {
        dispatch({ type: "ERROR", payload: err.message });
      }
    }

    fetchOrder();
  }, [id]);

  const handleStatusChange = async (status) => {
    await orderService.updateOrderStatus(id, status);
    dispatch({ type: "UPDATE_STATUS", payload: status });
  };

  if (state.loading) return <p className="p-6">{t("admin.common.loading")}</p>;
  if (state.error) return <p className="text-red-500 p-6">{state.error}</p>;
  if (!state.order) return <p className="p-6">{t("admin.orders.not_found")}</p>;

  const { order } = state;

  return (
    <div className="p-6 space-y-6">

      {/* ACTIONS */}
      <div className="flex gap-2">
        <Button onClick={() => navigate(-1)}>{t("admin.common.back")}</Button>
      </div>

      {/* BASIC INFO */}
      <div className="bg-white p-6 rounded shadow space-y-2">
        <h1 className="text-2xl font-bold">{t("admin.orders.details")}</h1>

        <p><strong>{t("admin.orders.id")}:</strong> {order._id}</p>
        <p><strong>{t("admin.users.col_user")}:</strong> {order.user?.name}</p>
        <p><strong>{t("admin.users.col_email")}:</strong> {order.user?.email}</p>

        <p>
          <strong>{t("admin.orders.col_status")}:</strong>{" "}
          <span className="font-semibold text-blue-600">
            {t(`orders.status_${order.status}`, order.status)}
          </span>
        </p>

        <p>
          <strong>{t("admin.orders.col_total")}:</strong>{" "}
          <span className="font-bold text-green-600">
            ${order.totalPrice}
          </span>
        </p>
      </div>

      {/* STATUS CONTROL */}
      <div className="bg-white p-4 rounded shadow flex gap-4 items-center">
        <span className="font-semibold">{t("admin.orders.update_status")}:</span>

        <select
          value={order.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="pending">{t("admin.orders.status.pending")}</option>
          <option value="paid">{t("admin.orders.status.paid")}</option>
          <option value="shipped">{t("admin.orders.status.shipped")}</option>
          <option value="delivered">{t("admin.orders.status.delivered")}</option>
        </select>
      </div>

      {/* ITEMS */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="font-bold mb-4">{t("admin.orders.items")}</h2>

        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between border p-3 rounded"
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {t("admin.orders.qty")}: {item.qty}
                </p>
              </div>

              <div className="font-bold">
                ${item.price * item.qty}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}