import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function LineChart({ data, dataKey, xKey }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data}>
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#3b82f6"
            strokeWidth={3}
          />
        </ReLineChart>
      </ResponsiveContainer>
    </div>
  );
}