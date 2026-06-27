import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function NotFound() {
  const { user } = useAuth();
  const homeLink = user ? `/${user.role}` : "/";

  return (
    <div className="auth-shell">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <div className="eyebrow">404</div>
        <h1 className="page-title" style={{ fontSize: "2rem" }}>
          Page not found
        </h1>
        <p className="page-subtitle" style={{ marginBottom: "1.5rem" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link className="btn" to={homeLink}>
          {user ? "Back to dashboard" : "Go home"}
        </Link>
      </div>
    </div>
  );
}
