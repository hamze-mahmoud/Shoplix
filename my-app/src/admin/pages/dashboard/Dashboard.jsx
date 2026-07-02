import { useEffect, useState, useRef } from "react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  DollarSign, Wallet, ShoppingBag, Package, Users, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, Clock,
} from "lucide-react";

import { useTranslation } from "react-i18next";

import { dashboardService } from "../../../Shared/services/dashboardService";
import { getSocket } from "../../../Shared/services/socket";
import { timeAgo } from "../../../Shared/utils/timeAgo";

const money = (n) => "$" + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

function Growth({ value }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-blue-600" : "text-red-500"}`}>
      <Icon className="w-3.5 h-3.5" />
      {Math.abs(value)}%
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, growth, sub, tone = "slate" }) {
  const tones = {
    emerald: "bg-blue-50 text-blue-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <Growth value={growth} />
      </div>
      <p className="mt-4 text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_TONE = {
  placed: "bg-blue-50 text-blue-600",
  confirmed: "bg-indigo-50 text-indigo-600",
  preparing: "bg-amber-50 text-amber-600",
  shipped: "bg-violet-50 text-violet-600",
  out_for_delivery: "bg-teal-50 text-teal-600",
  delivered: "bg-blue-50 text-blue-600",
  cancelled: "bg-red-50 text-red-600",
  pending: "bg-blue-50 text-blue-600",
  paid: "bg-indigo-50 text-indigo-600",
};

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [fin, setFin] = useState(null);
  const [sales, setSales] = useState([]);
  const [online, setOnline] = useState(0);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const flashRef = useRef(false);

  // Data fetch
  useEffect(() => {
    (async () => {
      try {
        const [statsRes, salesRes, finRes, ordersRes] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getSales(),
          dashboardService.getFinancialSummary({ period: "30d" }).catch(() => null),
          dashboardService.getRecentOrders().catch(() => null),
        ]);
        setStats(statsRes.data);
        setSales(salesRes.data || []);
        setFin(finRes?.data || null);
        const recent = ordersRes?.data?.data || ordersRes?.data || [];
        setLiveOrders(recent.slice(0, 8));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Realtime: presence + live order feed
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_admin");
    const onOnline = ({ count }) => setOnline(count);
    const onOrder = (order) => {
      setLiveOrders((prev) => [{ ...order, _isNew: true }, ...prev].slice(0, 12));
    };
    socket.on("online_users", onOnline);
    socket.on("order_created", onOrder);
    // re-join on reconnect
    socket.on("connect", () => socket.emit("join_admin"));
    return () => {
      socket.off("online_users", onOnline);
      socket.off("order_created", onOrder);
    };
  }, []);

  const c = fin?.current;
  const g = fin?.growth;

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.nav.dashboard")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.dashboard.subtitle")}</p>
        </div>

        {/* LIVE VISITORS */}
        <div className="flex items-center gap-3 px-5 py-3 bg-white rounded-xl shadow-sm border border-gray-100">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
          </span>
          <div>
            <p className="text-lg font-black text-gray-900 leading-none">{online}</p>
            <p className="text-[11px] uppercase tracking-wider text-gray-400">{t("admin.dashboard.live_visitors")}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-xl shadow-sm animate-pulse" />)}
        </div>
      ) : (
        <>
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard icon={DollarSign} tone="emerald" label={t("admin.dashboard.revenue_30d")} value={money(c?.grossRevenue)} growth={g?.revenue} />
            <KpiCard icon={Wallet} tone="blue" label={t("admin.dashboard.net_profit_30d")} value={money(c?.netProfit)} growth={g?.netProfit} sub={c ? t("admin.dashboard.margin", { value: c.netMargin }) : ""} />
            <KpiCard icon={ShoppingBag} tone="violet" label={t("admin.dashboard.orders_30d")} value={c?.orders ?? stats?.totalOrders ?? 0} growth={g?.orders} />
            <KpiCard icon={TrendingUp} tone="amber" label={t("admin.dashboard.avg_order")} value={money(c?.aov)} growth={g?.aov} />
            <KpiCard icon={Package} tone="rose" label={t("admin.nav.products")} value={stats?.totalProducts ?? 0} />
            <KpiCard icon={Users} tone="slate" label={t("admin.dashboard.customers")} value={stats?.totalUsers ?? 0} />
          </div>

          {/* CHART + LIVE FEED */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* REVENUE CHART */}
            <div className="lg:col-span-2 p-6 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{t("admin.dashboard.revenue_trend")}</h2>
                <span className="text-xs text-gray-400">{t("admin.dashboard.by_month")}</span>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sales}>
                    <defs>
                      <linearGradient id="dashRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v >= 1000 ? v / 1000 + "k" : v}`} />
                    <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Area type="monotone" dataKey="value" name={t("admin.dashboard.revenue")} stroke="#10b981" strokeWidth={2.5} fill="url(#dashRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* LIVE ORDERS FEED */}
            <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-blue-500" />
                <h2 className="font-semibold text-gray-900">{t("admin.dashboard.live_orders")}</h2>
              </div>

              {liveOrders.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-gray-400">
                  <Clock className="w-8 h-8 mb-2" />
                  <p className="text-sm">{t("admin.dashboard.waiting_orders")}</p>
                </div>
              ) : (
                <div className="space-y-2 overflow-y-auto max-h-80 -mx-2 px-2">
                  {liveOrders.map((o, i) => (
                    <div
                      key={o._id + i}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${o._isNew ? "bg-blue-50" : "hover:bg-gray-50"}`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          #{String(o._id).slice(-6)}
                          <span className="font-normal text-gray-400"> · {t("admin.dashboard.items_count", { count: o.itemCount ?? o.items?.length ?? 0 })}</span>
                        </p>
                        <p className="text-xs text-gray-400">{o.createdAt ? timeAgo(o.createdAt, i18n.language) : t("admin.dashboard.just_now")}</p>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-sm font-bold text-gray-900">{money(o.totalPrice)}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_TONE[o.status] || "bg-gray-100 text-gray-500"}`}>
                          {t(`orders.status_${o.status}`, o.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
