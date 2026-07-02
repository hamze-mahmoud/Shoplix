import api from "./api";

export const cartService = {
  // Add item
  addToCart: (data) => api.post("/cart", data),

  // Get full cart
  getCart: () => api.get("/cart"),

  // Remove single item (recommended to match product+variant)
  removeFromCart: (variantId) =>
    api.delete(`/cart/${variantId}`),

  // Update quantity
  updateQuantity: (productId, variantId, quantity) =>
    api.put(`/cart/item/${productId}/${variantId}`, {
      quantity,
    }),
};