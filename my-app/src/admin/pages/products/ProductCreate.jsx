import { useTranslation } from "react-i18next";
import ProductForm from "./components/ProductForm";
import { productService } from "../../../Shared/services/productService";

export default function ProductCreate() {
  const { t } = useTranslation();

  const handleSubmit = async (formData) => {
    try {
      await productService.createProduct(formData);
      alert(t("admin.products.created"));
    } catch (err) {
      console.error(err);
      alert(t("admin.products.create_error"));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{t("admin.products.create")}</h1>
      <ProductForm onSubmit={handleSubmit} />
    </div>
  );
}