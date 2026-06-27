import { useEffect, useState } from "react";
import api from "../../api/client.js";

export default function StudentProfile() {
  const [profile, setProfile] = useState(null);
  const [skillsInput, setSkillsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get("/students/me/profile").then((res) => {
      setProfile(res.data.user);
      setSkillsInput((res.data.user.skills || []).join(", "));
    });
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const skills = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const res = await api.put("/students/me/profile", {
        academicInfo: profile.academicInfo,
        skills,
      });
      setProfile(res.data.user);
      setMessage("Profile saved.");
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await api.post("/students/me/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data.user);
      setMessage("Resume uploaded.");
      setFile(null);
    } catch (err) {
      setMessage(err.response?.data?.error || "Resume upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function updateAcademic(field, value) {
    setProfile((p) => ({
      ...p,
      academicInfo: { ...p.academicInfo, [field]: value },
    }));
  }

  if (!profile) return <div className="layout">Loading...</div>;

  return (
    <div className="layout">
      <div className="page-header">
        <div className="eyebrow">Profile</div>
        <h1 className="page-title">{profile.name}</h1>
        <p className="page-subtitle">{profile.email}</p>
      </div>

      {message && <div className="error-banner">{message}</div>}

      <div className="section">
        <h3 className="card-title">Academic details</h3>
        <form onSubmit={handleSave}>
          <div className="field-row">
            <div className="field">
              <label>Degree</label>
              <input
                value={profile.academicInfo?.degree || ""}
                onChange={(e) => updateAcademic("degree", e.target.value)}
                placeholder="B.Tech"
              />
            </div>
            <div className="field">
              <label>Branch</label>
              <input
                value={profile.academicInfo?.branch || ""}
                onChange={(e) => updateAcademic("branch", e.target.value)}
                placeholder="CSE"
              />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Graduation year</label>
              <input
                type="number"
                value={profile.academicInfo?.graduationYear || ""}
                onChange={(e) =>
                  updateAcademic("graduationYear", Number(e.target.value))
                }
              />
            </div>
            <div className="field">
              <label>CGPA</label>
              <input
                type="number"
                step="0.01"
                value={profile.academicInfo?.cgpa || ""}
                onChange={(e) => updateAcademic("cgpa", Number(e.target.value))}
              />
            </div>
          </div>
          <div className="field">
            <label>Skills (comma separated)</label>
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </button>
        </form>
      </div>

      <div className="section">
        <h3 className="card-title">Resume</h3>
        {profile.resume?.originalName ? (
          <p className="card-meta">
            Uploaded: {profile.resume.originalName} on{" "}
            {new Date(profile.resume.uploadedAt).toLocaleDateString()}
          </p>
        ) : (
          <p className="card-meta">No resume uploaded yet.</p>
        )}
        <form onSubmit={handleResumeUpload}>
          <div className="field">
            <label>Upload PDF (max 5MB)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button className="btn btn-secondary" type="submit" disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload resume"}
          </button>
        </form>
      </div>
    </div>
  );
}
