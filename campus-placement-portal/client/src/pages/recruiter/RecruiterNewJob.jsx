import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client.js";

export default function RecruiterNewJob() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    ctc: "",
    minCgpa: "",
    branches: "",
    graduationYear: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.post("/jobs", {
        title: form.title,
        description: form.description,
        ctc: Number(form.ctc),
        eligibility: {
          minCgpa: form.minCgpa ? Number(form.minCgpa) : 0,
          branches: form.branches
            ? form.branches.split(",").map((b) => b.trim()).filter(Boolean)
            : [],
          graduationYear: form.graduationYear ? Number(form.graduationYear) : null,
        },
      });
      navigate("/recruiter");
    } catch (err) {
      setError(err.response?.data?.error || "Could not post job.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="layout">
      <div className="page-header">
        <div className="eyebrow">New posting</div>
        <h1 className="page-title">Post a job</h1>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} style={{ maxWidth: 560 }}>
        <div className="field">
          <label>Job title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="Software Engineer Intern"
            required
          />
        </div>
        <div className="field">
          <label>Description</label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label>CTC (LPA)</label>
          <input
            type="number"
            value={form.ctc}
            onChange={(e) => update("ctc", e.target.value)}
            required
          />
        </div>

        <div className="eyebrow" style={{ marginTop: "1.5rem" }}>
          Eligibility (leave blank for open to all)
        </div>
        <div className="field-row">
          <div className="field">
            <label>Minimum CGPA</label>
            <input
              type="number"
              step="0.1"
              value={form.minCgpa}
              onChange={(e) => update("minCgpa", e.target.value)}
            />
          </div>
          <div className="field">
            <label>Graduation year</label>
            <input
              type="number"
              value={form.graduationYear}
              onChange={(e) => update("graduationYear", e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Eligible branches (comma separated)</label>
          <input
            value={form.branches}
            onChange={(e) => update("branches", e.target.value)}
            placeholder="CSE, IT, ECE"
          />
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? "Posting..." : "Post job"}
          </button>
          <a href="/recruiter" className="btn btn-ghost" onClick={(e) => { e.preventDefault(); window.history.back(); }}>
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
