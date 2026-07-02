export default function RecommendedProductsSkeleton() {
  return (
    <div className="mt-10">
      <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-4" />

      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="
              w-40
              h-56
              bg-gray-100
              rounded-2xl
              animate-pulse
            "
          />
        ))}
      </div>
    </div>
  );
}