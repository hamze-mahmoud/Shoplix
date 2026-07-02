import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  const token = localStorage.getItem("accessToken");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  const isLoggedIn = token && token !== "undefined" && token !== "null";

  // Not logged in → go to login, remembering where they were headed
  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but wrong role (e.g. non-admin hitting an admin route)
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
