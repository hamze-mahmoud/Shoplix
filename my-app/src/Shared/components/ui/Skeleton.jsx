import React from "react";

/**
 * Skeleton Loader Component
 * For showing loading states before content loads
 */
export default function Skeleton({
  width = "100%",
  height = "1rem",
  count = 1,
  circle = false,
  className = "",
}) {
  const items = Array.from({ length: count });

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
          style={{
            width,
            height,
            backgroundColor: "#e5e7eb",
            borderRadius: circle ? "50%" : "0.5rem",
          }}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 animate-pulse">
      <div className="h-48 bg-neutral-200 rounded-lg" />
      <Skeleton height="1.5rem" width="80%" />
      <Skeleton height="1rem" width="100%" count={2} />
      <div className="flex gap-3 pt-2">
        <Skeleton height="2.5rem" width="40%" />
        <Skeleton height="2.5rem" width="60%" />
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
      <div className="h-64 bg-neutral-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-neutral-200 rounded w-3/4" />
        <div className="h-3 bg-neutral-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-neutral-200 rounded flex-1" />
          <div className="h-10 bg-neutral-200 rounded flex-1" />
        </div>
      </div>
    </div>
  );
}
