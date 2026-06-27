import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const NAV_BY_ROLE = {
  student: [
    { to: "/student", label: "Jobs" },
    { to: "/student/applications", label: "My Applications" },
    { to: "/student/profile", label: "Profile" },
  ],
  recruiter: [
    { to: "/recruiter", label: "My Jobs" },
    { to: "/recruiter/new", label: "Post a Job" },
  ],
  admin: [{ to: "/admin", label: "Applications" }],
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = user ? NAV_BY_ROLE[user.role] || [] : [];

  // When logged in the logo acts as a "home" shortcut to the user's dashboard.
  // When logged out it points to the public landing page.
  const brandTo = user ? `/${user.role}` : "/";

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to={brandTo} className="brand">
          <span className="brand-mark" />
          Campus Placement
        </Link>

        {user && (
          <nav className="nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
            <span className="role-tag">{user.role}</span>
            <button className="btn btn-ghost" onClick={logout}>
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
