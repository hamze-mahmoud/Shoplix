import { useEffect, useMemo, useState } from "react";
import { toastService } from "../../../Shared/services/toastService";
import { useTranslation } from "react-i18next";
import {
  Search, Users as UsersIcon, ShoppingBag, DollarSign, Crown,
  Trash2, ShieldCheck, ChevronLeft, ChevronRight,
} from "lucide-react";

import { userService } from "../../../Shared/services/userService";
import { timeAgo } from "../../../Shared/utils/timeAgo";

const money = (n) => "$" + Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
const fullName = (u) =>
  (u.name && u.name.trim()) ||
  [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
  u.email?.split("@")[0] ||
  "User";

const PAGE_SIZE = 8;

export default function UsersList() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const res = await userService.getAllUsers();
        setUsers(Array.isArray(res.data) ? res.data : res.data?.users || []);
      } catch (err) {
        setError(err.response?.data?.error || t("admin.users.load_error"));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id, name) => {
    const prev = users;
    setUsers((u) => u.filter((x) => x._id !== id));
    try {
      await userService.deleteUser(id);
      toastService.success(t("admin.users.removed", { name }));
    } catch {
      setUsers(prev);
      toastService.error(t("admin.users.delete_failed"));
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) => fullName(u).toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [users, query]);

  const totals = useMemo(() => {
    const customers = users.filter((u) => (u.orderCount || 0) > 0);
    return {
      users: users.length,
      customers: customers.length,
      revenue: users.reduce((s, u) => s + (u.totalSpent || 0), 0),
    };
  }, [users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Rank by spend across the full (unfiltered) list for the crown badge
  const topSpenderId = users[0]?.totalSpent > 0 ? users[0]._id : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 bg-white rounded-lg animate-pulse" />
        <div className="h-64 bg-white rounded-xl shadow-sm animate-pulse" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 bg-red-50 text-red-600 rounded-xl">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("admin.users.title")}</h1>
        <p className="text-sm text-gray-500 mt-0.5">{t("admin.users.subtitle")}</p>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><UsersIcon className="w-5 h-5" /></div>
          <div><p className="text-2xl font-black text-gray-900">{totals.users}</p><p className="text-sm text-gray-500">{t("admin.users.total_users")}</p></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
          <div><p className="text-2xl font-black text-gray-900">{totals.customers}</p><p className="text-sm text-gray-500">{t("admin.users.paying_customers")}</p></div>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
          <div><p className="text-2xl font-black text-gray-900">{money(totals.revenue)}</p><p className="text-sm text-gray-500">{t("admin.users.lifetime_revenue")}</p></div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={t("admin.users.search")}
            className="w-full ps-9 pe-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
          />
        </div>
        <span className="text-sm text-gray-400">{t("admin.users.results", { count: filtered.length })}</span>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-start font-semibold py-3 px-5">{t("admin.orders.col_customer")}</th>
                <th className="text-start font-semibold py-3 px-5">{t("admin.users.col_role")}</th>
                <th className="text-start font-semibold py-3 px-5">{t("admin.orders.col_status")}</th>
                <th className="text-end font-semibold py-3 px-5">{t("admin.nav.orders")}</th>
                <th className="text-end font-semibold py-3 px-5">{t("admin.users.total_spent")}</th>
                <th className="text-start font-semibold py-3 px-5">{t("admin.users.joined")}</th>
                <th className="text-start font-semibold py-3 px-5">{t("admin.users.last_login")}</th>
                <th className="text-end font-semibold py-3 px-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pageRows.map((u) => {
                const name = fullName(u);
                const isTop = u._id === topSpenderId;
                return (
                  <tr key={u._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate flex items-center gap-1.5">
                            {name}
                            {isTop && <Crown className="w-3.5 h-3.5 text-amber-500" title={t("admin.users.top_customer")} />}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${u.role === "admin" ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-600"}`}>
                        {u.role === "admin" && <ShieldCheck className="w-3 h-3" />}
                        {t(`admin.users.role_${u.role}`, u.role)}
                      </span>
                    </td>
                    <td className="py-3 px-5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${u.isActive === false ? "bg-gray-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}>
                        {u.isActive === false ? t("admin.users.inactive") : t("admin.users.active")}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-end font-medium text-gray-900">{u.orderCount || 0}</td>
                    <td className="py-3 px-5 text-end font-bold text-gray-900">{money(u.totalSpent)}</td>
                    <td className="py-3 px-5 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3 px-5 text-gray-500">{u.lastLogin ? timeAgo(u.lastLogin, i18n.language) : "—"}</td>
                    <td className="py-3 px-5 text-end">
                      {u.role !== "admin" && (
                        <button
                          onClick={() => handleDelete(u._id, name)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title={t("admin.users.delete_user")}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}

              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-400">{t("admin.users.empty")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{t("admin.common.page_of", { page, total: totalPages })}</span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
