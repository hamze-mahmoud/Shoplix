import { Link } from "react-router-dom";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatPrice } from "../../../../Shared/utils/formPrice";

export default function OrderCard({ order }) {
  return (
    <div className="group rounded-xl bg-white p-5 shadow-sm hover:shadow-md transition border border-gray-100">

      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Order #{order._id.slice(-6)}
          </h3>

          <p className="text-xs text-gray-500 mt-1">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {/* MIDDLE */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-500">
          {order.items.length} item{order.items.length > 1 ? "s" : ""}
        </div>

        <div className="text-base font-semibold text-gray-900">
          {formatPrice(order.totalPrice)}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-5 flex items-center justify-between">

        <Link
          to={`/orders/${order._id}`}
          className="text-sm font-medium text-gray-700 hover:text-black transition"
        >
          View details →
        </Link>

        <span className="text-xs text-gray-400">
          Click to track
        </span>
      </div>
    </div>
  );
}