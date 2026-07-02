import { useTranslation } from "react-i18next";

export default function StatsCards({ stats }) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

      <Card title={t("admin.nav.products")} value={stats.totalProducts} />
      <Card title={t("admin.nav.users")} value={stats.totalUsers} />
      <Card title={t("admin.nav.orders")} value={stats.totalOrders} />
      <Card title={t("admin.dashboard.revenue")} value={`$${stats.totalRevenue}`} />

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded shadow">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-xl font-bold">{value}</h2>
    </div>
  );
}