import { useEffect, useState, useMemo, useRef } from "react";
import gsap from "gsap";
import {
  ResponsiveContainer, ComposedChart, Area, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import {
  DollarSign, TrendingUp, TrendingDown, Wallet, Package2,
  ShoppingBag, Percent, Download, ArrowUpRight, ArrowDownRight,
} from "lucide-react";

import { useTranslation } from "react-i18next";

import { dashboardService } from "../../../Shared/services/dashboardService";

const PERIODS = [
  { key: "today", labelKey: "admin.financial.period_today" },
  { key: "7d", labelKey: "admin.financial.period_7d" },
  { key: "30d", labelKey: "admin.financial.period_30d" },
  { key: "3m", labelKey: "admin.financial.period_3m" },
  { key: "year", labelKey: "admin.financial.period_year" },
  { key: "custom", labelKey: "admin.analytics.period_custom" },
];

const fmt = (n) =>
  "$" + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fmtFull = (n) =>
  "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function GrowthPill({ value }) {
  if (value === undefined || value === null) return null;
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
      up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
    }`}>
      <Icon className="w-3 h-3" />
      {Math.abs(value)}%
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, growth, accent = "green", hint }) {
  const accents = {
    green: "from-green-500 to-blue-600",
    blue: "from-blue-500 to-indigo-600",
    violet: "from-violet-500 to-purple-600",
    amber: "from-amber-500 to-orange-600",
    rose: "from-rose-500 to-red-600",
    slate: "from-slate-600 to-gray-700",
  };
  return (
    <div data-kpi className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accents[accent]} flex items-center justify-center text-white shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <GrowthPill value={growth} />
      </div>
      <p className="mt-4 text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function FinancialReports() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState("30d");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState({ granularity: "day", points: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const gridRef = useRef(null);

  useEffect(() => {
    let active = true;
    const params = period === "custom"
      ? { period, from: custom.from, to: custom.to }
      : { period };

    // Don't fetch custom until both dates chosen
    if (period === "custom" && (!custom.from || !custom.to)) return;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, t] = await Promise.all([
          dashboardService.getFinancialSummary(params),
          dashboardService.getProfitTrend(params),
        ]);
        if (!active) return;
        setSummary(s.data);
        setTrend(t.data);
      } catch (err) {
        if (active) setError(err.response?.data?.message || t("admin.financial.load_error"));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [period, custom.from, custom.to]);

  // GSAP entrance for KPI cards
  useEffect(() => {
    if (!summary || !gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo("[data-kpi]",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power3.out" }
      );
    }, gridRef);
    return () => ctx.revert();
  }, [summary]);

  const c = summary?.current;
  const g = summary?.growth;

  const chartData = useMemo(() => {
    const unit = trend.granularity;
    return (trend.points || []).map((p) => {
      const d = new Date(p.date);
      const label =
        unit === "month" ? d.toLocaleDateString(undefined, { month: "short", year: "2-digit" })
        : unit === "year" ? String(d.getFullYear())
        : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      return { ...p, label };
    });
  }, [trend]);

  const breakdown = useMemo(() => {
    if (!c) return [];
    return [
      { name: t("admin.dashboard.revenue"), value: c.grossRevenue, fill: "#10b981" },
      { name: t("admin.financial.cogs_short"), value: c.cogs, fill: "#f59e0b" },
      { name: t("admin.analytics.gross_profit"), value: c.grossProfit, fill: "#6366f1" },
      { name: t("admin.financial.shipping"), value: c.shipping, fill: "#94a3b8" },
      { name: t("admin.analytics.net_profit"), value: c.netProfit, fill: "#22c55e" },
    ];
  }, [c, t]);

  const exportCsv = () => {
    if (!chartData.length) return;
    const header = ["date", "revenue", "cogs", "grossProfit", "netProfit", "orders"];
    const rows = chartData.map((p) =>
      [new Date(p.date).toISOString().slice(0, 10), p.revenue, p.cogs, p.grossProfit, p.netProfit, p.orders].join(",")
    );
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">{t("admin.nav.financial")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("admin.financial.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm flex-wrap">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                  period === p.key ? "bg-green-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t(p.labelKey)}
              </button>
            ))}
          </div>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gray-900 text-white hover:bg-gray-800 transition"
          >
            <Download className="w-4 h-4" />
            {t("admin.financial.export_csv")}
          </button>
        </div>
      </div>

      {/* CUSTOM RANGE */}
      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <label className="text-sm text-gray-500">{t("admin.orders.from")}
            <input type="date" value={custom.from} onChange={(e) => setCustom((s) => ({ ...s, from: e.target.value }))}
              className="ms-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
          </label>
          <label className="text-sm text-gray-500">{t("admin.orders.to")}
            <input type="date" value={custom.to} onChange={(e) => setCustom((s) => ({ ...s, to: e.target.value }))}
              className="ms-2 border border-gray-200 rounded-lg px-3 py-1.5 text-sm" />
          </label>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-100" />)}
        </div>
      ) : c ? (
        <>
          {/* KPI CARDS */}
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <KpiCard icon={DollarSign} label={t("admin.financial.gross_revenue")} value={fmt(c.grossRevenue)} growth={g?.revenue} accent="green" />
            <KpiCard icon={Package2} label={t("admin.financial.cost_of_goods")} value={fmt(c.cogs)} accent="amber" />
            <KpiCard icon={TrendingUp} label={t("admin.analytics.gross_profit")} value={fmt(c.grossProfit)} accent="violet" hint={t("admin.analytics.margin_pct", { value: c.grossMargin })} />
            <KpiCard icon={Wallet} label={t("admin.analytics.net_profit")} value={fmt(c.netProfit)} growth={g?.netProfit} accent="blue" hint={t("admin.financial.net_margin_pct", { value: c.netMargin })} />
            <KpiCard icon={ShoppingBag} label={t("admin.nav.orders")} value={c.orders} growth={g?.orders} accent="slate" />
            <KpiCard icon={Percent} label={t("admin.financial.avg_order_value")} value={fmt(c.aov)} growth={g?.aov} accent="rose" />
          </div>

          {/* TREND CHART */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">{t("admin.financial.revenue_profit_trend")}</h2>
              <span className="text-xs text-gray-400 capitalize">{t("admin.analytics.by_granularity", { unit: trend.granularity })}</span>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v >= 1000 ? (v/1000)+"k" : v}`} />
                  <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" name={t("admin.dashboard.revenue")} stroke="#10b981" strokeWidth={2} fill="url(#rev)" />
                  <Line type="monotone" dataKey="grossProfit" name={t("admin.analytics.gross_profit")} stroke="#6366f1" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="netProfit" name={t("admin.analytics.net_profit")} stroke="#22c55e" strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* BREAKDOWN + INSIGHT */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-gray-900 mb-4">{t("admin.financial.profit_breakdown")}</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" tickFormatter={(v) => `$${v >= 1000 ? (v/1000)+"k" : v}`} />
                    <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {breakdown.map((b, i) => <Cell key={i} fill={b.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* INSIGHT CARD */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-center">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                {c.netProfit >= 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : <TrendingDown className="w-5 h-5 text-red-400" />}
              </div>
              <p className="text-sm text-white/70">{t("admin.financial.net_margin_period")}</p>
              <p className="text-4xl font-black mt-1">{c.netMargin}%</p>
              <p className="text-sm text-white/60 mt-3 leading-relaxed">
                {t("admin.financial.insight_pre")}{" "}
                <span className="text-green-400 font-semibold">{fmt(c.netProfit)}</span>{" "}
                {t("admin.financial.insight_mid")}{" "}
                <span className="text-white font-semibold">{fmt(c.grossRevenue)}</span>{" "}
                {t("admin.financial.insight_post", { count: c.orders })}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
