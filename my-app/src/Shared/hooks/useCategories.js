import { useFetch } from "./useFetch";
import { categoryService } from "../services/categoryService";

export function useCategories() {
  return useFetch(() => categoryService.getAllCategories(), []);
}