import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/client.js";

export default function RecruiterJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/jobs")
      .then((res) => setJobs(res.data.jobs))
      .catch(() => setError("Could not load your job postings. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <div className="page-header">
        <div className="card-row">
          <div>
            <div className="eyebrow">Recruiter</div>
            <h1 className="page-title">My job postings</h1>
          </div>
          <Link to="/recruiter/new" className="btn">
            Post a job
          </Link>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : jobs.length === 0 && !error ? (
        <div className="empty-state">You haven't posted any jobs yet.</div>
      ) : (
        jobs.map((job) => (
          <div className="card" key={job._id}>
            <div className="card-row">
              <div>
                <h3 className="card-title">{job.title}</h3>
                <div className="card-meta">CTC: ₹{job.ctc} LPA</div>
              </div>
              <Link className="btn btn-secondary" to={`/recruiter/jobs/${job._id}`}>
                View applicants
              </Link>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
