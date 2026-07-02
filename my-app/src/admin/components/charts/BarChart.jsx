import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function BarChart({ data, dataKey, xKey }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={dataKey} fill="#10b981" />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}