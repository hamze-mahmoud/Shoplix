import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isModalOpen: false,
    theme: "light",
  },

  reducers: {
    openModal: (state) => {
      state.isModalOpen = true;
    },

    closeModal: (state) => {
      state.isModalOpen = false;
    },

    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
  },
});

export const { openModal, closeModal, toggleTheme } = uiSlice.actions;

export default uiSlice.reducer;