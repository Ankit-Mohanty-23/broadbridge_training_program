import express from "express";
import Application from "../models/Application.js";
import JobPosting from "../models/JobPosting.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// POST /api/applications - student applies to a job
router.post("/", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ error: "jobId is required." });

    const job = await JobPosting.findById(jobId);
    if (!job || !job.isActive) {
      return res.status(404).json({ error: "Job not found or no longer active." });
    }

    const application = await Application.create({
      student: req.user.id,
      job: jobId,
    });

    res.status(201).json({ application });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "You've already applied to this job." });
    }
    res.status(500).json({ error: "Could not submit application.", detail: err.message });
  }
});

// GET /api/applications/me - student views own applications
router.get("/me", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate("job", "title ctc")
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch applications.", detail: err.message });
  }
});

// GET /api/applications/job/:jobId - recruiter/admin views applicants for a job
router.get(
  "/job/:jobId",
  requireAuth,
  requireRole("recruiter", "admin"),
  async (req, res) => {
    try {
      const applications = await Application.find({ job: req.params.jobId })
        .populate("student", "name email skills academicInfo resume")
        .sort({ createdAt: -1 });
      res.json({ applications });
    } catch (err) {
      res.status(500).json({ error: "Could not fetch applicants.", detail: err.message });
    }
  }
);

// GET /api/applications - admin views all applications across all jobs
router.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const applications = await Application.find({})
      .populate("student", "name email")
      .populate("job", "title")
      .sort({ createdAt: -1 });
    res.json({ applications });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch applications.", detail: err.message });
  }
});

// PATCH /api/applications/:id/status - admin updates application status
router.patch("/:id/status", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    if (!["applied", "shortlisted", "rejected", "selected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) return res.status(404).json({ error: "Application not found." });
    res.json({ application });
  } catch (err) {
    res.status(500).json({ error: "Could not update status.", detail: err.message });
  }
});

// PATCH /api/applications/:id/interview - recruiter assigns interview slot
router.patch(
  "/:id/interview",
  requireAuth,
  requireRole("recruiter"),
  async (req, res) => {
    try {
      const { scheduledAt, mode, notes } = req.body;

      const application = await Application.findByIdAndUpdate(
        req.params.id,
        { interviewSlot: { scheduledAt, mode, notes } },
        { new: true }
      );

      if (!application) return res.status(404).json({ error: "Application not found." });
      res.json({ application });
    } catch (err) {
      res.status(500).json({ error: "Could not assign interview slot.", detail: err.message });
    }
  }
);

export default router;
