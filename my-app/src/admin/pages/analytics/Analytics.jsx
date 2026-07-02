import { useEffect, useState, useMemo } from "react";
import {
  ResponsiveContainer, ComposedChart, Area, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, Wallet, ShoppingBag, Package, Percent,
  ArrowUpRight, ArrowDownRight, Crown, Boxes, AlertTriangle, Download,
} from "lucide-react";

import { useTranslation } from "react-i18next";

import { dashboardService } from "../../../Shared/services/dashboardService";
import { userService } from "../../../Shared/services/userService";
import { productService } from "../../../Shared/services/productService";

const PERIODS = [
  { key: "today", labelKey: "admin.analytics.period_today" },
  { key: "7d", labelKey: "admin.analytics.period_7d" },
  { key: "30d", labelKey: "admin.analytics.period_30d" },
  { key: "3m", labelKey: "admin.analytics.period_3m" },
  { key: "year", labelKey: "admin.analytics.period_year" },
  { key: "custom", labelKey: "admin.analytics.period_custom" },
];
const PIE = ["#10b981", "#6366f1", "#f59e0b", "#ec4899", "#14b8a6", "#8b5cf6", "#ef4444"];

const money = (n) => "$" + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fullName = (u) =>
  (u.name && u.name.trim()) || [u.firstName, u.lastName].filter(Boolean).join(" ").trim() || u.email?.split("@")[0] || "User";

function Growth({ value }) {
  if (value == null) return null;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${up ? "text-blue-600" : "text-red-500"}`}>
      <Icon className="w-3.5 h-3.5" />{Math.abs(value)}%
    </span>
  );
}

function Kpi({ icon: Icon, label, value, growth, sub, tone = "slate" }) {
  const tones = {
    emerald: "bg-blue-50 text-blue-600", blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600", slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className="p-5 bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}><Icon className="w-5 h-5" /></div>
        <Growth value={growth} />
      </div>
      <p className="mt-3 text-xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Panel({ title, icon: Icon, action, children, className = "" }) {
  return (
    <div className={`p-5 bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          <h2 className="font-semibold text-gray-900">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState({ granularity: "day", points: [] });
  const [cats, setCats] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [best, setBest] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  const params = useMemo(
    () => (period === "custom" ? { period, from: custom.from, to: custom.to } : { period }),
    [period, custom.from, custom.to]
  );

  // Period-dependent data
  useEffect(() => {
    if (period === "custom" && (!custom.from || !custom.to)) return;
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const [s, t, c] = await Promise.all([
          dashboardService.getFinancialSummary(params),
          dashboardService.getProfitTrend(params),
          dashboardService.getCategoryAnalytics(params),
        ]);
        if (!active) return;
        setSummary(s.data); setTrend(t.data); setCats(c.data || []);
      } catch (e) { console.error(e); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [params, period, custom.from, custom.to]);

  // Period-independent data (once)
  useEffect(() => {
    (async () => {
      try {
        const [u, b, l] = await Promise.all([
          userService.getAllUsers().catch(() => ({ data: [] })),
          productService.getBestSellers({ limit: 6 }).catch(() => ({ data: [] })),
          dashboardService.getLowStock({ threshold: 5 }).catch(() => ({ data: [] })),
        ]);
        setCustomers((Array.isArray(u.data) ? u.data : []).filter((x) => x.totalSpent > 0).slice(0, 5));
        setBest(b.data || []);
        setLowStock(l.data || []);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const c = summary?.current;
  const g = summary?.growth;

  const chartData = useMemo(() => {
    const unit = trend.granularity;
    return (trend.points || []).map((p) => {
      const d = new Date(p.date);
      const label = unit === "month" ? d.toLocaleDateString(undefined, { month: "short", year: "2-digit" })
        : unit === "year" ? String(d.getFullYear())
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { ...p, label };
    });
  }, [trend]);

  const exportCsv = () => {
    if (!chartData.length) return;
    const rows = [["date", "revenue", "cogs", "grossProfit", "netProfit", "orders"].join(",")];
    chartData.forEach((p) => rows.push([new Date(p.date).toISOString().slice(0, 10), p.revenue, p.cogs, p.grossProfit, p.netProfit, p.orders].join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `analytics-${period}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.nav.analytics")}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{t("admin.analytics.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-wrap">
            {PERIODS.map((p) => (
              <button key={p.key} onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${period === p.key ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}>
                {t(p.labelKey)}
              </button>
            ))}
          </div>
          <button onClick={exportCsv} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition">
            <Download className="w-4 h-4" />CSV
          </button>
        </div>
      </div>

      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">{t("admin.orders.from")}
            <input type="date" value={custom.from} onChange={(e) => setCustom((s) => ({ ...s, from: e.target.value }))} className="ms-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" /></label>
          <label className="text-sm text-gray-500">{t("admin.orders.to")}
            <input type="date" value={custom.to} onChange={(e) => setCustom((s) => ({ ...s, to: e.target.value }))} className="ms-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" /></label>
        </div>
      )}

      {/* SALES OVERVIEW KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Kpi icon={DollarSign} tone="emerald" label={t("admin.dashboard.revenue")} value={loading ? "…" : money(c?.grossRevenue)} growth={g?.revenue} />
        <Kpi icon={TrendingUp} tone="violet" label={t("admin.analytics.gross_profit")} value={loading ? "…" : money(c?.grossProfit)} sub={c ? t("admin.analytics.margin_pct", { value: c.grossMargin }) : ""} />
        <Kpi icon={Wallet} tone="blue" label={t("admin.analytics.net_profit")} value={loading ? "…" : money(c?.netProfit)} growth={g?.netProfit} sub={c ? t("admin.analytics.net_pct", { value: c.netMargin }) : ""} />
        <Kpi icon={ShoppingBag} tone="amber" label={t("admin.nav.orders")} value={loading ? "…" : (c?.orders ?? 0)} growth={g?.orders} />
        <Kpi icon={Boxes} tone="rose" label={t("admin.analytics.units_sold")} value={loading ? "…" : (c?.units ?? 0)} />
        <Kpi icon={Percent} tone="slate" label={t("admin.dashboard.avg_order")} value={loading ? "…" : money(c?.aov)} growth={g?.aov} />
      </div>

      {/* TREND + CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Panel title={t("admin.analytics.revenue_profit_trend")} className="lg:col-span-2"
          action={<span className="text-xs text-gray-400 capitalize">{t("admin.analytics.by_granularity", { unit: trend.granularity })}</span>}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} /><stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v >= 1000 ? v / 1000 + "k" : v}`} />
                <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Legend />
                <Area type="monotone" dataKey="revenue" name={t("admin.dashboard.revenue")} stroke="#10b981" strokeWidth={2} fill="url(#aRev)" />
                <Line type="monotone" dataKey="grossProfit" name={t("admin.analytics.gross_profit")} stroke="#6366f1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="netProfit" name={t("admin.analytics.net_profit")} stroke="#22c55e" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title={t("admin.analytics.popular_categories")} icon={Boxes}>
          {cats.length === 0 ? (
            <p className="text-sm text-gray-400 py-12 text-center">{t("admin.analytics.no_category_sales")}</p>
          ) : (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={cats} dataKey="revenue" nameKey="name" innerRadius={42} outerRadius={68} paddingAngle={2}>
                      {cats.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {cats.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-600 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: PIE[i % PIE.length] }} />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="font-semibold text-gray-900">{money(cat.revenue)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Panel>
      </div>

      {/* TOP CUSTOMERS + BEST SELLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel title={t("admin.analytics.top_customers")} icon={Crown}>
          {customers.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">{t("admin.analytics.no_customer_purchases")}</p> : (
            <div className="space-y-2">
              {customers.map((u, i) => (
                <div key={u._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className={`w-6 text-center text-sm font-bold ${i === 0 ? "text-amber-500" : "text-gray-300"}`}>{i + 1}</span>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold">{fullName(u).charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{fullName(u)}</p>
                    <p className="text-xs text-gray-400">{t("admin.analytics.orders_count", { count: u.orderCount })}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{money(u.totalSpent)}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title={t("admin.analytics.best_sellers")} icon={TrendingUp}>
          {best.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">{t("admin.analytics.no_sales")}</p> : (
            <div className="space-y-2">
              {best.map((p, i) => (
                <div key={p._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <span className="w-6 text-center text-sm font-bold text-gray-300">{i + 1}</span>
                  <div className="w-9 h-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.category?.name || "—"}</p>
                  </div>
                  <p className="text-sm font-bold text-blue-600">{t("admin.analytics.sold_count", { count: p.sold })}</p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      {/* LOW STOCK ALERTS */}
      <Panel title={t("admin.analytics.low_stock")} icon={AlertTriangle}>
        {lowStock.length === 0 ? <p className="text-sm text-gray-400 py-8 text-center">{t("admin.analytics.well_stocked")}</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStock.map((p) => (
              <div key={p._id} className={`flex items-center gap-3 p-3 rounded-lg border ${p.totalStock === 0 ? "border-red-200 bg-red-50/60" : "border-amber-200 bg-amber-50/60"}`}>
                <div className="w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0 flex items-center justify-center">
                  {p.image ? <img src={p.image} className="w-full h-full object-cover" alt="" /> : <Package className="w-4 h-4 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 truncate">{p.category}</p>
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.totalStock === 0 ? "bg-red-100 text-red-600" : "bg-amber-100 text-amber-600"}`}>
                  {p.totalStock === 0 ? t("admin.analytics.out") : t("admin.analytics.left_count", { count: p.totalStock })}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
