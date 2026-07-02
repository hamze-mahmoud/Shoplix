import { BrowserRouter, useRoutes, useNavigate } from "react-router-dom";
import { Suspense, useEffect } from "react";

import publicRoutes from "./publicRoutes";
import adminRoutes from "./adminRoutes";

import AppLayout from "../app/AppLayout";
import AdminLayout from "../admin/layout/AdminLayout";
import { setNavigator } from "../Shared/services/navigation";

// Registers react-router navigation so modules outside the component tree
// (toast actions, contexts) can navigate as a clean SPA transition.
function NavigationBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigator(navigate);
    return () => setNavigator(null);
  }, [navigate]);
  return null;
}

function AppRoutes() {

  const routes = [
    {
      path: "/",
      element: <AppLayout />,
      children: publicRoutes,
    },

    {
      path: "/admin",
      element: <AdminLayout />,
      children: adminRoutes,
    },
  ];

  return useRoutes(routes);
}

export default function Router() {


  return (
    <BrowserRouter>
        <NavigationBridge />
        <AppRoutes />
    </BrowserRouter>
  );
}