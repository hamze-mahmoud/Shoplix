import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/authService";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data) => {
    const res = await authService.login(data);
    return res.data;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: localStorage.getItem("token") || null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem("token", action.payload.token);
    });
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;