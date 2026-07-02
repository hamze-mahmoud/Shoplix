import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Lock, MessageSquareText, PenLine, Clock } from "lucide-react";
import gsap from "gsap";

import Reveal from "../../../../../Shared/components/Reveal";
import useAuth from "../../../../../Shared/hooks/useAuth";
import { reviewService } from "../../../../../Shared/services/reviewService";
import { toastService } from "../../../../../Shared/services/toastService";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";
import ReviewCard from "./ReviewCard";

const EMPTY_SUMMARY = { average: 0, count: 0, distribution: [] };

export default function ReviewsSection({ productId, onSummaryChange }) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const barsRef = useRef([]);

  const loadReviews = async () => {
    const res = await reviewService.getProductReviews(productId);
    setReviews(res.data.data || []);
    const nextSummary = res.data.summary || EMPTY_SUMMARY;
    setSummary(nextSummary);
    onSummaryChange?.(nextSummary);
  };

  const loadEligibility = async () => {
    if (!isAuthenticated) {
      setEligibility(null);
      return;
    }
    try {
      const res = await reviewService.getEligibility(productId);
      setEligibility(res.data);
    } catch {
      setEligibility(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([loadReviews(), loadEligibility()]).finally(() => setLoading(false));
  }, [productId, isAuthenticated]);

  // Animate the rating-distribution bars growing in once data lands.
  useEffect(() => {
    if (!summary.count) return;
    const bars = barsRef.current.filter(Boolean);
    gsap.fromTo(
      bars,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.7, ease: "power3.out", stagger: 0.06, transformOrigin: "left" }
    );
  }, [summary]);

  const handleSubmit = async ({ rating, comment }) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      if (eligibility?.hasReviewed && eligibility.existingReview) {
        await reviewService.updateReview(eligibility.existingReview._id, rating, comment);
      } else {
        await reviewService.createReview(productId, rating, comment);
      }
      setShowForm(false);
      // Reviews are moderated — it won't appear publicly until approved.
      toastService.info(t("reviews.submitted_pending"));
      await Promise.all([loadReviews(), loadEligibility()]);
    } catch (err) {
      setSubmitError(err.response?.data?.message || t("reviews.submit_failed", "Failed to submit review"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm(t("reviews.confirm_delete", "Delete your review?"))) return;
    await reviewService.deleteReview(reviewId);
    await Promise.all([loadReviews(), loadEligibility()]);
  };

  const myReviewId = eligibility?.existingReview?._id;

  return (
    <div className="mt-20 sm:mt-28 border-t border-[#111827]/10 pt-16">
      <Reveal>
        <h2 className="text-3xl sm:text-4xl font-light flex items-center gap-3">
          <MessageSquareText className="w-7 h-7 text-green-600" />
          {t("reviews.title", "Customer Reviews")}
        </h2>
      </Reveal>

      {!loading && (
        <Reveal delay={0.05} className="mt-10 grid sm:grid-cols-[auto_1fr] gap-10 items-start">
          {/* Aggregate score */}
          <div className="text-center sm:text-left">
            <p className="text-6xl font-black text-[#111827]">{summary.average || "—"}</p>
            <StarRating value={summary.average} size="md" className="mt-2 justify-center sm:justify-start" />
            <p className="mt-2 text-sm text-[#111827]/50">
              {t("reviews.count", "{{count}} reviews", { count: summary.count })}
            </p>
          </div>

          {/* Distribution bars */}
          <div className="w-full max-w-md space-y-1.5">
            {summary.distribution?.map(({ star, count }, i) => {
              const pct = summary.count ? (count / summary.count) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs text-[#111827]/60">
                  <span className="w-3 shrink-0">{star}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#111827]/8 overflow-hidden">
                    <div
                      ref={(el) => (barsRef.current[i] = el)}
                      className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-green-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* Gating / write-a-review */}
      <div className="mt-10">
        {!isAuthenticated && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#111827]/5 px-5 py-4 text-sm text-[#111827]/70">
            <Lock className="w-4 h-4 shrink-0" />
            {t("reviews.login_required", "Log in to write a review.")}{" "}
            <Link to="/login" className="font-semibold text-green-600 hover:underline">
              {t("nav.login")}
            </Link>
          </div>
        )}

        {isAuthenticated && eligibility && !eligibility.hasPurchased && (
          <div className="flex items-center gap-3 rounded-2xl bg-[#111827]/5 px-5 py-4 text-sm text-[#111827]/70">
            <Lock className="w-4 h-4 shrink-0" />
            {t("reviews.purchase_required", "Purchase this product to leave a review.")}
          </div>
        )}

        {isAuthenticated && eligibility?.canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#111827] text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition"
          >
            <PenLine className="w-4 h-4" />
            {t("reviews.write", "Write a review")}
          </button>
        )}

        {isAuthenticated && eligibility?.hasReviewed && !showForm && (
          <div className="space-y-3">
            {eligibility.existingReview?.status === "pending" && (
              <div className="flex items-center gap-3 rounded-2xl bg-yellow-50 border border-yellow-200 px-5 py-4 text-sm text-yellow-800">
                <Clock className="w-4 h-4 shrink-0" />
                {t("reviews.pending_note")}
              </div>
            )}
            {eligibility.existingReview?.status === "rejected" && (
              <div className="flex items-center gap-3 rounded-2xl bg-[#111827]/5 px-5 py-4 text-sm text-[#111827]/70">
                <Lock className="w-4 h-4 shrink-0" />
                {t("reviews.rejected_note")}
              </div>
            )}
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 border border-[#111827]/15 text-[#111827] font-semibold px-5 py-2.5 rounded-xl hover:bg-[#111827]/5 transition"
            >
              <PenLine className="w-4 h-4" />
              {t("reviews.edit_yours", "Edit your review")}
            </button>
          </div>
        )}

        {showForm && (
          <div className="mt-4">
            <ReviewForm
              initialRating={eligibility?.existingReview?.rating || 0}
              initialComment={eligibility?.existingReview?.comment || ""}
              submitLabel={eligibility?.hasReviewed ? t("reviews.update", "Update review") : t("reviews.submit", "Submit review")}
              loading={submitting}
              error={submitError}
              onSubmit={handleSubmit}
              onCancel={() => { setShowForm(false); setSubmitError(null); }}
            />
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-12">
        {reviews.length === 0 && !loading && (
          <p className="text-sm text-[#111827]/50">
            {t("reviews.empty", "No reviews yet — be the first to share your thoughts.")}
          </p>
        )}

        {reviews.map((review, i) => (
          <ReviewCard
            key={review._id}
            review={review}
            delay={i * 0.05}
            isOwn={review._id === myReviewId || review.user?._id === user?._id}
            onEdit={() => setShowForm(true)}
            onDelete={() => handleDelete(review._id)}
          />
        ))}
      </div>
    </div>
  );
}
