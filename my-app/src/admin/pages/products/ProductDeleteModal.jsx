import { useTranslation } from "react-i18next";

export default function ProductDeleteModal({ product, onClose, onDelete }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">

      <div className="bg-white p-6 rounded shadow">

        <h2 className="text-lg font-bold">
          {t("admin.products.delete_confirm", { name: product.name })}
        </h2>

        <div className="flex gap-4 mt-4">
          <button
            onClick={() => onDelete(product._id)}
            className="bg-red-500 text-white px-4 py-2"
          >
            {t("admin.common.delete")}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2"
          >
            {t("admin.common.cancel")}
          </button>
        </div>

      </div>

    </div>
  );
}