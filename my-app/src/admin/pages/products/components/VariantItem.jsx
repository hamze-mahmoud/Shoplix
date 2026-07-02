import { useTranslation } from "react-i18next";
import TextField from "../../../components/forms/TextField";
import Button from "../../../components/ui/Button";

export default function VariantItem({
  index,
  variant,
  updateVariant,
  removeVariant,
  addImages,
}) {
  const { t } = useTranslation();
  return (
    <div className="border p-4 rounded space-y-3 bg-gray-50">

      <div className="grid grid-cols-2 gap-3">

        <TextField
          label={t("admin.products.color")}
          value={variant.color}
          onChange={(e) =>
            updateVariant(index, "color", e.target.value)
          }
        />

        <TextField
          label={t("admin.products.storage")}
          value={variant.storage}
          onChange={(e) =>
            updateVariant(index, "storage", e.target.value)
          }
        />

        <TextField
          label={t("admin.products.col_price")}
          type="number"
          value={variant.price}
          onChange={(e) =>
            updateVariant(index, "price", e.target.value)
          }
        />

        <TextField
          label={t("admin.products.col_stock")}
          type="number"
          value={variant.stock}
          onChange={(e) =>
            updateVariant(index, "stock", e.target.value)
          }
        />

      </div>

      {/* 🔥 Upload Images */}
      <input
        type="file"
        multiple
        onChange={(e) =>
          addImages(index, e.target.files)
        }
      />

      {/* 🔥 Preview */}
      <div className="flex gap-2 flex-wrap">
        {variant.images?.map((img, i) => (
          <img
            key={i}
            src={URL.createObjectURL(img)}
            alt=""
            className="w-16 h-16 object-cover rounded"
          />
        ))}
      </div>

      <Button
        className="bg-red-500"
        onClick={() => removeVariant(index)}
      >
        {t("admin.products.delete_variant")}
      </Button>

    </div>
  );
}