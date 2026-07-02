import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  },

  reducers: {
    addToCart(state, action) {
      const item = action.payload;

      const existing = state.items.find(
        (p) =>
          p.productId === item.productId &&
          p.variantId === item.variantId
      );

      if (existing) {
        existing.quantity += item.quantity;
      } else {
        state.items.push(item);
      }

      state.totalQuantity += item.quantity;
      state.totalPrice += item.price * item.quantity;
    },

    removeFromCart(state, action) {
      const item = state.items.find((p) => p.id === action.payload);

      if (item) {
        state.totalQuantity -= item.quantity;
        state.totalPrice -= item.price * item.quantity;
      }

      state.items = state.items.filter(
        (p) => p.id !== action.payload
      );
    },

    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
    },
  },
});

export const { addToCart, removeFromCart, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;