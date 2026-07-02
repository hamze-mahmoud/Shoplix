import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderCard() {
  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">

      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Order #12345</p>
          <p className="text-sm text-gray-500">Placed on Jan 12</p>
        </div>

        <OrderStatusBadge status="delivered" />
      </div>

      <div className="mt-4 flex gap-3">
        <img
          src="https://via.placeholder.com/60"
          className="w-16 h-16 rounded-lg"
        />
        <div>
          <p className="text-sm font-medium">Product Name</p>
          <p className="text-xs text-gray-500">₪120</p>
        </div>
      </div>
    </div>
  );
}