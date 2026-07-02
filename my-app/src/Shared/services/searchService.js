import api from "./api";

export const searchService = {

  searchProducts: (params) =>
    api.get("/products/search", { params }),

  autocomplete: (keyword) =>
    api.get("/products/autocomplete", {
      params: { keyword },
    }),
};