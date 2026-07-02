export default function OrderStatusBadge({ status }) {
  const styles = {
    delivered: "bg-green-100 text-green-600",
    pending: "bg-yellow-100 text-yellow-600",
    cancelled: "bg-red-100 text-red-600",
  };

  return (
    <span className={`text-xs px-3 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}