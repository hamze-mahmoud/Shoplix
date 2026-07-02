import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

import { store } from "../Shared/store";
import Router from "../routes"; // 🔥 from index.jsx

import "../index.css"; // Tailwind
import { CartProvider } from "../public/context/CartContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
 


<CartProvider>
     <Router />
</CartProvider>
    </Provider>
  </React.StrictMode>
);