import { lazy } from "react";
import ProtectedRoute from "./protectedRoute";

/* DASHBOARD */
const Dashboard = lazy(() =>
  import("../admin/pages/dashboard/Dashboard")
);

/* FINANCIAL */
const FinancialReports = lazy(() =>
  import("../admin/pages/financial/FinancialReports")
);

/* ANALYTICS */
const Analytics = lazy(() =>
  import("../admin/pages/analytics/Analytics")
);

/* PRODUCTS */
const ProductsList = lazy(() =>
  import("../admin/pages/products/ProductsList")
);
const ProductCreate = lazy(() =>
  import("../admin/pages/products/ProductCreate")
);
const ProductEdit = lazy(() =>
  import("../admin/pages/products/ProductEdit")
);

/* CATEGORIES */
const CategoriesList = lazy(() =>
  import("../admin/pages/categories/CategoriesList")
);
const CategoryCreate = lazy(() =>
  import("../admin/pages/categories/CategoryCreate")
);
const CategoryEdit = lazy(() =>
  import("../admin/pages/categories/CategoryEdit")
);
const CategoryPreview = lazy(() =>
  import("../admin/pages/categories/CategoryPreview")
);

/* ORDERS */
const OrdersList = lazy(() =>
  import("../admin/pages/orders/OrdersList")
);
const OrderDetails = lazy(() =>
  import("../admin/pages/orders/OrderDetails")
);

/* USERS */
const UsersList = lazy(() =>
  import("../admin/pages/users/UsersList")
);

/* REVIEWS */
const ReviewsList = lazy(() =>
  import("../admin/pages/reviews/ReviewsList")
);

/* BANNERS */
const BannersList = lazy(() =>
  import("../admin/pages/banners/BannersList")
);

/* CLEAN ROUTES */
const adminRoutes = [
  {
    path: "/admin",
    element: (
      <ProtectedRoute role="admin">
        <Dashboard />
      </ProtectedRoute>
    ),
  },

  /* FINANCIAL */
  {
    path: "/admin/financial",
    element: (
      <ProtectedRoute role="admin">
        <FinancialReports />
      </ProtectedRoute>
    ),
  },

  /* ANALYTICS */
  {
    path: "/admin/analytics",
    element: (
      <ProtectedRoute role="admin">
        <Analytics />
      </ProtectedRoute>
    ),
  },

  /* PRODUCTS */
  {
    path: "/admin/products",
    element: (
      <ProtectedRoute role="admin">
        <ProductsList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/products/create",
    element: (
      <ProtectedRoute role="admin">
        <ProductCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/products/edit/:id",
    element: (
      <ProtectedRoute role="admin">
        <ProductEdit />
      </ProtectedRoute>
    ),
  },

  /* CATEGORIES */
  {
    path: "/admin/categories",
    element: (
      <ProtectedRoute role="admin">
        <CategoriesList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/categories/create",
    element: (
      <ProtectedRoute role="admin">
        <CategoryCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/categories/edit/:id",
    element: (
      <ProtectedRoute role="admin">
        <CategoryEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/category/:id",
    element: (
      <ProtectedRoute role="admin">
        <CategoryPreview />
      </ProtectedRoute>
    ),
  },

  /* ORDERS */
  {
    path: "/admin/orders",
    element: (
      <ProtectedRoute role="admin">
        <OrdersList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/orders/:id",
    element: (
      <ProtectedRoute role="admin">
        <OrderDetails />
      </ProtectedRoute>
    ),
  },

  /* USERS */
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute role="admin">
        <UsersList />
      </ProtectedRoute>
    ),
  },

  /* REVIEWS */
  {
    path: "/admin/reviews",
    element: (
      <ProtectedRoute role="admin">
        <ReviewsList />
      </ProtectedRoute>
    ),
  },

  /* BANNERS */
  {
    path: "/admin/banners",
    element: (
      <ProtectedRoute role="admin">
        <BannersList />
      </ProtectedRoute>
    ),
  },
];
export default adminRoutes;