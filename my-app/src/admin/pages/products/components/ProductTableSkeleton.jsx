// admin/pages/products/components/table/ProductTableSkeleton.jsx

export default function ProductTableSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden">
      {/* TABLE HEADER */}
      <div className="grid grid-cols-7 gap-4 p-4 bg-gray-100 border-b">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-300 rounded animate-pulse"
          />
        ))}
      </div>

      {/* TABLE ROWS */}
      {Array.from({ length: 8 }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-7 gap-4 p-4 border-b items-center"
        >
          {/* IMAGE */}
          <div className="w-14 h-14 bg-gray-300 rounded-lg animate-pulse" />

          {/* NAME */}
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
          </div>

          {/* CATEGORY */}
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />

          {/* PRICE */}
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse" />

          {/* STOCK */}
          <div className="h-4 w-12 bg-gray-300 rounded animate-pulse" />

          {/* STATUS */}
          <div className="h-8 w-20 bg-gray-300 rounded-full animate-pulse" />

          {/* ACTIONS */}
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
            <div className="w-8 h-8 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}