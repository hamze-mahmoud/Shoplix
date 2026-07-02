import { useFetch } from "./useFetch";
import { productService } from "../services/productService";

export function useProductDetails(id) {
  return useFetch(
    () => productService.getProductById(id),
    [id]
  );
}