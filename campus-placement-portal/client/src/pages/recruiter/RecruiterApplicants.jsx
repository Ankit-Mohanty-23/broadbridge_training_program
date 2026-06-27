import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/client.js";

export default function RecruiterApplicants() {
  const { jobId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schedulingId, setSchedulingId] = useState(null);
  const [slotForm, setSlotForm] = useState({ scheduledAt: "", mode: "", notes: "" });

  useEffect(() => {
    loadApplicants();
  }, [jobId]);

  async function loadApplicants() {
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      setApplications(res.data.applications);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load applicants. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleScheduleSubmit(applicationId) {
    setError("");
    try {
      await api.patch(`/applications/${applicationId}/interview`, slotForm);
      setSchedulingId(null);
      setSlotForm({ scheduledAt: "", mode: "", notes: "" });
      loadApplicants();
    } catch (err) {
      setError(err.response?.data?.error || "Could not schedule interview.");
    }
  }

  return (
    <div className="layout">
      <div className="page-header">
        <div className="eyebrow">Applicants</div>
        <h1 className="page-title">Candidates for this role</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : applications.length === 0 && !error ? (
        <div className="empty-state">No applicants yet.</div>
      ) : (
        applications.map((app) => (
          <div className="card" key={app._id}>
            <div className="card-row">
              <div style={{ flex: 1 }}>
                <h3 className="card-title">{app.student?.name}</h3>
                <div className="card-meta">{app.student?.email}</div>
                <p className="card-meta">
                  {app.student?.academicInfo?.branch} &middot; CGPA{" "}
                  {app.student?.academicInfo?.cgpa ?? "—"} &middot; Skills:{" "}
                  {(app.student?.skills || []).join(", ") || "—"}
                </p>
                {app.student?.resume?.originalName && (
                  <p className="card-meta">Resume: {app.student.resume.originalName}</p>
                )}

                {app.status === "shortlisted" &&
                  (schedulingId === app._id ? (
                    <div style={{ marginTop: "1rem", maxWidth: 400 }}>
                      <div className="field">
                        <label>Interview date/time</label>
                        <input
                          type="datetime-local"
                          value={slotForm.scheduledAt}
                          onChange={(e) =>
                            setSlotForm((s) => ({ ...s, scheduledAt: e.target.value }))
                          }
                        />
                      </div>
                      <div className="field">
                        <label>Mode</label>
                        <input
                          value={slotForm.mode}
                          onChange={(e) =>
                            setSlotForm((s) => ({ ...s, mode: e.target.value }))
                          }
                          placeholder="Online / Room 204"
                        />
                      </div>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleScheduleSubmit(app._id)}
                      >
                        Confirm slot
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost"
                      style={{ marginTop: "0.75rem" }}
                      onClick={() => setSchedulingId(app._id)}
                    >
                      Assign interview slot
                    </button>
                  ))}
              </div>
              <span className={`status status-${app.status}`}>{app.status}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
