import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function StudentJobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedIds, setAppliedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    loadJobs();
    loadApplications();
  }, []);

  async function loadJobs() {
    try {
      const res = await api.get("/jobs");
      setJobs(res.data.jobs);
    } catch (err) {
      setError("Could not load jobs.");
    } finally {
      setLoading(false);
    }
  }

  async function loadApplications() {
    try {
      const res = await api.get("/applications/me");
      setAppliedIds(new Set(res.data.applications.map((a) => a.job?._id)));
    } catch (err) {
      // non-fatal
    }
  }

  async function handleApply(jobId) {
    setApplyingId(jobId);
    setError("");
    try {
      await api.post("/applications", { jobId });
      setAppliedIds((prev) => new Set(prev).add(jobId));
    } catch (err) {
      setError(err.response?.data?.error || "Could not apply.");
    } finally {
      setApplyingId(null);
    }
  }

  return (
    <div className="layout">
      <div className="page-header">
        <div className="eyebrow">Browse</div>
        <h1 className="page-title">Open positions</h1>
        <p className="page-subtitle">Roles matching your academic profile and eligibility.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading jobs...</p>
      ) : jobs.length === 0 ? (
        <div className="empty-state">No eligible job postings yet. Check back soon.</div>
      ) : (
        jobs.map((job) => (
          <div className="card" key={job._id}>
            <div className="card-row">
              <div>
                <h3 className="card-title">{job.title}</h3>
                <div className="card-meta">
                  {job.recruiter?.company || job.recruiter?.name} &middot; CTC: ₹{job.ctc} LPA
                </div>
                <p>{job.description}</p>
              </div>
              <button
                className="btn"
                disabled={appliedIds.has(job._id) || applyingId === job._id}
                onClick={() => handleApply(job._id)}
              >
                {appliedIds.has(job._id)
                  ? "Applied"
                  : applyingId === job._id
                  ? "Applying..."
                  : "Apply"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
