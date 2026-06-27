import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="layout">
      <div style={{ padding: "5rem 0", maxWidth: 640 }}>
        <div className="eyebrow">Campus Placement Portal</div>
        <h1 className="page-title" style={{ fontSize: "2.6rem" }}>
          Where students, recruiters, and the placement cell meet.
        </h1>
        <p className="page-subtitle" style={{ marginBottom: "2rem" }}>
          Apply to jobs, post openings, and manage the entire placement
          pipeline in one place — no spreadsheets required.
        </p>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link className="btn" to="/register">
            Get started
          </Link>
          <Link className="btn btn-secondary" to="/login">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
