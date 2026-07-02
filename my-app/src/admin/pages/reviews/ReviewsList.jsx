import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Star, Check, X, MessageSquareText, Loader2 } from "lucide-react";

import { reviewService } from "../../../Shared/services/reviewService";
import { toastService } from "../../../Shared/services/toastService";
import { localized } from "../../../Shared/utils/localize";

const TABS = ["pending", "approved", "rejected", "all"];

const STATUS_STYLES = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

function Stars({ value }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= value ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </div>
  );
}

export default function ReviewsList() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;

  const [tab, setTab] = useState("pending");
  const [reviews, setReviews] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = async (status = tab) => {
    setLoading(true);
    try {
      const res = await reviewService.adminGetReviews(status);
      setReviews(res.data.data || []);
      setPendingCount(res.data.pendingCount || 0);
    } catch {
      toastService.error(t("admin.reviews.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const setStatus = async (review, status) => {
    setActingId(review._id);
    try {
      await reviewService.adminSetStatus(review._id, status);
      toastService.success(
        t(status === "approved" ? "admin.reviews.approved_msg" : "admin.reviews.rejected_msg")
      );
      await load(tab);
    } catch {
      toastService.error(t("admin.reviews.action_failed"));
    } finally {
      setActingId(null);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareText className="w-6 h-6 text-blue-600" />
          {t("admin.reviews.title")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("admin.reviews.subtitle")}</p>
      </div>

      {/* TABS */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              tab === s
                ? "bg-[#111827] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t(`admin.reviews.tab_${s}`)}
            {s === "pending" && pendingCount > 0 && (
              <span className="ms-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-yellow-400 text-[#111827] text-xs font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 p-10 justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          {t("admin.common.loading")}
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-500">
          {t("admin.reviews.empty")}
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div
              key={r._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-start gap-4"
            >
              {/* MAIN */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {localized(r.product, "name", lang) || r.product?.name || "—"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      STATUS_STYLES[r.status] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t(`admin.reviews.status_${r.status}`, r.status)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {r.user?.firstName} {r.user?.lastName}
                  </span>
                  <span>{r.user?.email}</span>
                  <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>

                <Stars value={r.rating} />

                {r.comment ? (
                  <p className="text-sm text-gray-700 leading-relaxed break-words">{r.comment}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">{t("admin.reviews.no_comment")}</p>
                )}
              </div>

              {/* ACTIONS */}
              <div className="flex sm:flex-col gap-2 shrink-0">
                {r.status !== "approved" && (
                  <button
                    onClick={() => setStatus(r, "approved")}
                    disabled={actingId === r._id}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 active:scale-95 transition disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    {t("admin.reviews.approve")}
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button
                    onClick={() => setStatus(r, "rejected")}
                    disabled={actingId === r._id}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 active:scale-95 transition disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    {t("admin.reviews.reject")}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
