import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * Wraps routes that should only be accessible to unauthenticated users
 * (landing, login, register). If a user is already logged in they are
 * redirected straight to their role dashboard.
 */
export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  // Still hydrating – don't flash a redirect prematurely
  if (loading) return null;

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}
