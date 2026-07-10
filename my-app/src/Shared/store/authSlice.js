import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/authService";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data) => {
    const res = await authService.login(data);
    return res.data;
  }
);

// NOTE: tokens/identity are memory-only by design (see api.js) — this slice
// must never write them to localStorage.
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
  },
});

export const { logoutUser } = authSlice.actions;
export default authSlice.reducer;