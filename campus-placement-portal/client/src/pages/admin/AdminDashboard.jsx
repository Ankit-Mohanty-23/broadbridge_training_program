import { useEffect, useState } from "react";
import api from "../../api/client.js";

const STATUS_OPTIONS = ["applied", "shortlisted", "rejected", "selected"];

export default function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await api.get("/applications");
      setApplications(res.data.applications);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, status) {
    try {
      await api.patch(`/applications/${id}/status`, { status });
      setApplications((prev) =>
        prev.map((a) => (a._id === id ? { ...a, status } : a))
      );
    } catch (err) {
      alert(err.response?.data?.error || "Could not update status.");
    }
  }

  return (
    <div className="layout">
      <div className="page-header">
        <div className="eyebrow">Admin</div>
        <h1 className="page-title">All applications</h1>
        <p className="page-subtitle">Manage the placement pipeline across every job posting.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">No applications yet.</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Job</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id}>
                <td>{app.student?.name}</td>
                <td>{app.job?.title}</td>
                <td>
                  <span className={`status status-${app.status}`}>{app.status}</span>
                </td>
                <td>
                  <select
                    value={app.status}
                    onChange={(e) => handleStatusChange(app._id, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
