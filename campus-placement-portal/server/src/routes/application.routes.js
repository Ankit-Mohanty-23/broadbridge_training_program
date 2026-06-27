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
// BUG-06 FIX: recruiters can only view applicants for their OWN jobs
router.get(
  "/job/:jobId",
  requireAuth,
  requireRole("recruiter", "admin"),
  async (req, res) => {
    try {
      // For recruiters, verify the job belongs to them before exposing applicants
      if (req.user.role === "recruiter") {
        const job = await JobPosting.findOne({
          _id: req.params.jobId,
          recruiter: req.user.id,
        });
        if (!job) {
          return res
            .status(403)
            .json({ error: "You don't have access to this job's applicants." });
        }
      }

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
// BUG-07 FIX: only the recruiter who owns the job can assign interview slots
router.patch(
  "/:id/interview",
  requireAuth,
  requireRole("recruiter"),
  async (req, res) => {
    try {
      const { scheduledAt, mode, notes } = req.body;

      // First fetch the application and verify the job belongs to this recruiter
      const application = await Application.findById(req.params.id).populate("job");
      if (!application) {
        return res.status(404).json({ error: "Application not found." });
      }
      if (application.job.recruiter.toString() !== req.user.id.toString()) {
        return res
          .status(403)
          .json({ error: "You don't have permission to modify this application." });
      }

      application.interviewSlot = { scheduledAt, mode, notes };
      await application.save();

      res.json({ application });
    } catch (err) {
      res.status(500).json({ error: "Could not assign interview slot.", detail: err.message });
    }
  }
);

export default router;
