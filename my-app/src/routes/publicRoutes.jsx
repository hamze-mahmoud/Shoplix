import { lazy } from "react";
import ProtectedRoute from "./protectedRoute";

/* PUBLIC PAGES */
const Home = lazy(() => import("../public/pages/Home"));
const ProductsPage = lazy(() => import("../public/pages/products/ProductsPage"));
const ProductDetails = lazy(() => import("../public/pages/products/components/details/ProductDetails"));

const CategoriesPage = lazy(() => import("../public/pages/categories/CategoriesPage"));
const CategoryPage = lazy(() => import("../public/pages/categories/CategoryDetails"));

const CategoryProductsPreview = lazy(() =>
  import("../public/pages/categories/components/CategoryProductsPreview")
);

const SearchPage = lazy(() => import("../public/pages/search/SearchPage"));

const OffersPage = lazy(() => import("../public/pages/offers/OffersPage"));
const OfferDetails = lazy(() => import("../public/pages/offers/OfferDetails"));

const TailoredPage = lazy(() => import("../public/pages/tailored/TailoredPage"));

const About = lazy(() => import("../public/pages/About"));
const Contact = lazy(() => import("../public/pages/Contact"));
const Privacy = lazy(() => import("../public/pages/Privacy"));

const ComponentShowcase = lazy(() =>
  import("../Shared/pages/ComponentShowcase")
);

/* AUTH */
const Login = lazy(() => import("../public/pages/auth/Login"));
const Register = lazy(() => import("../public/pages/auth/Register"));

const VerifyEmail = lazy(() => import("../public/pages/auth/VerifyEmail"));
const VerifySuccess = lazy(() => import("../public/pages/auth/VerifySuccess"));
const VerifyError = lazy(() => import("../public/pages/auth/VerifyError"));

/* CART / CHECKOUT (should later be protected) */
const Cart = lazy(() => import("../public/pages/cart/Cart"));
const CheckoutPage = lazy(() => import("../public/pages/checkOut/CheckoutPage"));

/* ORDERS */
const OrdersPage = lazy(() => import("../public/pages/Orders/OrdersPage"));
const OrderDetailsPage = lazy(() =>
  import("../public/pages/Orders/OrderDetailsPage")
);

/* PROFILE */
const Profile = lazy(() => import("../public/pages/profile/Profile"));

const PublicRoutes = [
  /* HOME */
  { path: "/", element: <Home /> },

  /* PRODUCTS */
  { path: "/products", element: <ProductsPage /> },
  { path: "/products/:id", element: <ProductDetails /> },

  /* CATEGORIES */
  { path: "/categories", element: <CategoriesPage /> },
  { path: "/categories/:id", element: <CategoryPage /> },
  { path: "/categories/child/products/:id", element: <CategoryProductsPreview /> },

  /* SEARCH */
  { path: "/search", element: <SearchPage /> },

  /* OFFERS */
  { path: "/offers", element: <OffersPage /> },
  { path: "/offers/:id", element: <OfferDetails /> },

  /* TAILORED FOR YOU (AI picks by audience) */
  { path: "/tailored", element: <TailoredPage /> },

  /* COMPANY */
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  // Public + unguarded: Meta requires a reachable privacy-policy URL to publish
  // the WhatsApp app (Development → Live).
  { path: "/privacy", element: <Privacy /> },

  /* SHOWCASE */
  { path: "/showcase", element: <ComponentShowcase /> },

  /* CART */
  { path: "/cart", element: <Cart /> },

  /* AUTH */
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  /* EMAIL VERIFY */
  { path: "/verify-email", element: <VerifyEmail /> },
  { path: "/verify-success", element: <VerifySuccess /> },
  { path: "/verify-error", element: <VerifyError /> },

  /* ORDERS — require login */
  { path: "/orders", element: <ProtectedRoute><OrdersPage /></ProtectedRoute> },
  { path: "/orders/:id", element: <ProtectedRoute><OrderDetailsPage /></ProtectedRoute> },
  { path: "/checkout", element: <ProtectedRoute><CheckoutPage /></ProtectedRoute> },


  /* PROFILE — require login */
  { path: "/profile", element: <ProtectedRoute><Profile /></ProtectedRoute> },
];
 export default PublicRoutes;