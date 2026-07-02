import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

export default function PieChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie data={data} dataKey="value" outerRadius={100}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
}