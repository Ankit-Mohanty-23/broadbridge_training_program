import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth();

  // Show a spinner while the auth state is being resolved instead of a blank flash
  if (loading) {
    return (
      <div className="auth-shell">
        <p className="muted-link">Loading...</p>
      </div>
    );
  }

  // Not logged in → send to login
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but wrong role → send to their own dashboard, not the landing page
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
}
