import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../Shared/AuthContext";

// Route guard driven by the SERVER-VERIFIED session (AuthContext user from
// /auth/me), never by client storage. localStorage/cookies are editable by
// anyone in DevTools — a role read from there could be forged to open admin
// pages. Here, no verified user (or wrong role) → no page, full stop.
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  // Session still being verified against the server — hold rendering.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-[#16A34A] animate-spin" />
      </div>
    );
  }

  // Not logged in → go to login, remembering where they were headed
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but wrong role (e.g. non-admin hitting an admin route)
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
