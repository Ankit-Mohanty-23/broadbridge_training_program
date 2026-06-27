import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/applications/me")
      .then((res) => setApplications(res.data.applications))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <div className="page-header">
        <div className="eyebrow">Track</div>
        <h1 className="page-title">My applications</h1>
        <p className="page-subtitle">Status updates and interview slots, in one place.</p>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 ? (
        <div className="empty-state">You haven't applied to any jobs yet.</div>
      ) : (
        applications.map((app) => (
          <div className="card" key={app._id}>
            <div className="card-row">
              <div>
                <h3 className="card-title">{app.job?.title || "Job posting removed"}</h3>
                <div className="card-meta">
                  CTC: ₹{app.job?.ctc ?? "—"} LPA
                </div>
                {app.interviewSlot?.scheduledAt && (
                  <p>
                    Interview: {new Date(app.interviewSlot.scheduledAt).toLocaleString()}
                    {app.interviewSlot.mode ? ` — ${app.interviewSlot.mode}` : ""}
                  </p>
                )}
              </div>
              <span className={`status status-${app.status}`}>{app.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
