import OrderCard from "./components/OrderCard";

export default function Orders() {
  const orders = [1, 2, 3];

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      <div className="flex flex-col gap-4">
        {orders.map((order) => (
          <OrderCard key={order} />
        ))}
      </div>
    </div>
  );
}