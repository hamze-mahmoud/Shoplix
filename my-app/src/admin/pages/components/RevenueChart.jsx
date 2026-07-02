import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTranslation } from "react-i18next";

export default function RevenueChart({ data }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white p-6 rounded-xl shadow h-[300px]">
      <h2 className="mb-4 font-semibold">{t("admin.dashboard.revenue")}</h2>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line dataKey="revenue" stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}