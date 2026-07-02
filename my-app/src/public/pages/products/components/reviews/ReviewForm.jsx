import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Send } from "lucide-react";
import gsap from "gsap";

import StarRating from "./StarRating";

export default function ReviewForm({
  initialRating = 0,
  initialComment = "",
  submitLabel,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const ref = useRef();

  useEffect(() => {
    gsap.fromTo(
      ref.current,
      { opacity: 0, y: 14, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating < 1) return;
    onSubmit({ rating, comment });
  };

  return (
    <form
      ref={ref}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#111827]/10 bg-white p-6 space-y-4 shadow-sm"
    >
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#111827]/50 mb-2">
          {t("reviews.your_rating", "Your rating")}
        </label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-[#111827]/50 mb-2">
          {t("reviews.your_review", "Your review")}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          maxLength={1000}
          placeholder={t("reviews.placeholder", "Share your thoughts on this product…")}
          className="w-full resize-none rounded-xl border border-[#111827]/15 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-500 transition"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading || rating < 1}
          className="flex items-center gap-2 bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {submitLabel || t("reviews.submit", "Submit review")}
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#111827]/60 hover:bg-[#111827]/5 transition"
          >
            {t("reviews.cancel", "Cancel")}
          </button>
        )}
      </div>
    </form>
  );
}
