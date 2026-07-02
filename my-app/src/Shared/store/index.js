import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import userReducer from "./userSlice";
import uiReducer from "./uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    ui: uiReducer,
  },
});