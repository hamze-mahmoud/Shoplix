import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import SaleBadge from "../../../../Shared/components/SaleBadge";
import { discountOf, salePrice } from "../../../../Shared/utils/pricing";

export default function ProductTable({ products = [], onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-white shadow rounded-xl overflow-hidden">

        {/* HEADER */}
        <thead className="bg-gray-100 text-left text-sm">
          <tr>
            <th className="p-3">{t("admin.products.col_product")}</th>
            <th className="p-3">{t("admin.nav.categories")}</th>
            <th className="p-3">{t("admin.products.col_variants")}</th>
            <th className="p-3">{t("admin.products.col_price")}</th>
            <th className="p-3">{t("admin.products.col_stock")}</th>
            <th className="p-3 text-center">{t("admin.common.actions")}</th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody className="text-sm">
          {products.map((p) => {
            const variants = p.variants || [];

            const minPrice = variants.length
              ? Math.min(...variants.map((v) => v.price))
              : 0;

            const maxPrice = variants.length
              ? Math.max(...variants.map((v) => v.price))
              : 0;

            const totalStock = variants.reduce(
              (sum, v) => sum + (v.stock || 0),
              0
            );

            const discount = discountOf(p);

            return (
              <tr
                key={p._id}
                className="border-t hover:bg-gray-50 transition"
              >
                {/* PRODUCT NAME */}
                <td className="p-3 font-semibold">
                  <div className="flex items-center gap-2">
                    <span>{p.name}</span>
                    {discount > 0 && <SaleBadge percent={discount} />}
                  </div>
                </td>

                {/* CATEGORY */}
                <td className="p-3 text-gray-600">
                  {p.category?.name || "—"}
                </td>

                {/* VARIANTS */}
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    {variants.slice(0, 3).map((v, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 px-2 py-1 rounded-full"
                      >
                        {[v.color, v.storage].filter(Boolean).join(" / ")}
                      </span>
                    ))}

                    {variants.length > 3 && (
                      <span className="text-xs text-gray-500">
                        {t("admin.products.more_variants", { count: variants.length - 3 })}
                      </span>
                    )}
                  </div>
                </td>

                {/* PRICE RANGE */}
                <td className="p-3">
                  {!variants.length ? (
                    "—"
                  ) : discount > 0 ? (
                    <div className="flex flex-col leading-tight">
                      <span className="text-gray-400 line-through text-xs">
                        ${minPrice} - ${maxPrice}
                      </span>
                      <span className="text-rose-600 font-semibold">
                        ${salePrice(minPrice, discount)} - ${salePrice(maxPrice, discount)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-green-600 font-medium">
                      ${minPrice} - ${maxPrice}
                    </span>
                  )}
                </td>

                {/* STOCK */}
                <td className="p-3">
                  <span
                    className={`font-medium ${
                      totalStock > 5
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {totalStock}
                  </span>
                </td>

                {/* ACTIONS */}
                <td className="p-3">
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      to={`/admin/products/edit/${p._id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      {t("admin.common.edit")}
                    </Link>
                    <span className="text-gray-300">|</span>
                    <button
                      onClick={() => onDelete(p._id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      {t("admin.common.delete")}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}