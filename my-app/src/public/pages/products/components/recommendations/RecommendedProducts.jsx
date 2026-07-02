import { useEffect, useState } from "react";
import { productService } from "../../../../../Shared/services/productService";
import RecommendedProductsSkeleton from "./RecommendedProductsSkeleton";
import RecommendedProductsSlider from "./RecommendedProductsSlider";

export default function RecommendedProducts({ productId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
console.log("products",products)
console.log("productId",productId)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data } =
          await productService.getRecommendedProducts(
            productId
          );

        setProducts(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchData();
  }, [productId]);
if (!products.length) {
    return (
      <div className="mt-10 text-center text-gray-400">
        No recommendations available right now
      </div>
    );
  }
  if (loading) {
    return <RecommendedProductsSkeleton />;
  }

  if (!products.length) return null;
// 🔥 2. Empty state (IMPORTANT)
  
  return (
    <section className="mt-20">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        You May Also Like
      </h2>

      <RecommendedProductsSlider
        products={products}
      />
    </section>
  );
}