export default function Pagination({ page, pages, setPage }) {
  return (
    <div className="flex justify-center mt-10 gap-2">

      {/* PREV */}
      <button
        onClick={() => setPage(Math.max(page - 1, 1))}
        className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
      >
        Prev
      </button>

      {Array.from({ length: pages }).map((_, i) => (
        <button
          key={i}
          onClick={() => setPage(i + 1)}
          className={`
            w-9 h-9 text-sm rounded-lg transition
            ${
              page === i + 1
                ? "bg-green-500 text-white shadow"
                : "bg-gray-100 hover:bg-gray-200"
            }
          `}
        >
          {i + 1}
        </button>
      ))}

      {/* NEXT */}
      <button
        onClick={() => setPage(Math.min(page + 1, pages))}
        className="px-3 py-1 text-sm rounded-lg bg-gray-100 hover:bg-gray-200"
      >
        Next
      </button>

    </div>
  );
}