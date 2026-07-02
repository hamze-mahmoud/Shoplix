import { Trash2, Pencil, Eye } from "lucide-react";

export default function Table({
  columns = [],
  data = [],
  renderRow,
  loading = false,
  emptyMessage = "No data found",
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full border-collapse">

          {/* Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-gray-100">

            {/* Loading */}
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            )}

            {/* Empty */}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-16 text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            )}

            {/* Rows */}
            {!loading &&
              data.map((item, index) => (
                <tr
                  key={item._id || index}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  {renderRow(item)}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}