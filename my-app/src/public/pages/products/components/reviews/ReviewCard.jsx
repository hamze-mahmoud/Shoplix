import { useTranslation } from "react-i18next";
import { Pencil, Trash2 } from "lucide-react";

import Reveal from "../../../../../Shared/components/Reveal";
import StarRating from "./StarRating";

export default function ReviewCard({ review, isOwn, delay = 0, onEdit, onDelete }) {
  const { t, i18n } = useTranslation();
  const name = [review.user?.firstName, review.user?.lastName].filter(Boolean).join(" ") || "Anonymous";
  const initial = name.charAt(0).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString(i18n.language, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <Reveal delay={delay} y={20}>
      <div className="flex gap-4 py-6 border-b border-[#111827]/8 last:border-b-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white text-sm font-bold shrink-0">
          {initial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm text-[#111827]">
                {name} {isOwn && <span className="ml-1 text-xs font-medium text-green-600">({t("reviews.you", "You")})</span>}
              </p>
              <p className="text-xs text-[#111827]/40">{date}</p>
            </div>

            {isOwn && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onEdit}
                  aria-label="Edit review"
                  className="p-1.5 rounded-lg text-[#111827]/40 hover:text-green-600 hover:bg-green-50 transition"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onDelete}
                  aria-label="Delete review"
                  className="p-1.5 rounded-lg text-[#111827]/40 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <StarRating value={review.rating} size="sm" className="mt-2" />

          {review.comment && (
            <p className="mt-2 text-sm text-[#111827]/70 leading-relaxed">{review.comment}</p>
          )}
        </div>
      </div>
    </Reveal>
  );
}
