import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "./Shared/store";
import Router from "./routes";

import "./index.css";
import "./i18n";

import { CartProvider } from "./public/context/CartContext";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./Shared/AuthContext";
import { NotificationProvider } from "./Shared/context/NotificationContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Toaster
      position="top-right"
      gutter={12}
      containerStyle={{ top: 84, right: 16, left: 16 }}
    />
    <AuthProvider>
      <Provider store={store}>
        <CartProvider>
          <NotificationProvider>
            <Router />
          </NotificationProvider>
       </CartProvider>
      </Provider>
    </AuthProvider>
  </React.StrictMode>
);