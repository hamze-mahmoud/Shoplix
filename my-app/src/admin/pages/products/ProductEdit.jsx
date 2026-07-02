import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ProductForm from "./components/ProductForm";
import { productService } from "../../../Shared/services/productService";

export default function ProductEdit() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productService.getProductById(id).then((res) => {
      setProduct(res.data);
    });
  }, [id]);

  const handleUpdate = async (formData) => {
    await productService.updateProduct(id, formData);
    alert(t("admin.products.updated"));
  };

  if (!product) return <p>{t("admin.common.loading")}</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">{t("admin.products.edit")}</h1>

      <ProductForm
        initialData={product}
        onSubmit={handleUpdate}
      />
    </div>
  );
}