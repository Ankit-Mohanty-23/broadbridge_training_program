import express from "express";
import JobPosting from "../models/JobPosting.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// POST /api/jobs - recruiter creates a job posting
router.post("/", requireAuth, requireRole("recruiter"), async (req, res) => {
  try {
    const { title, description, ctc, eligibility } = req.body;
    if (!title || !description || ctc === undefined) {
      return res.status(400).json({ error: "Title, description, and CTC are required." });
    }

    const job = await JobPosting.create({
      recruiter: req.user.id,
      title,
      description,
      ctc,
      eligibility: eligibility || {},
    });

    res.status(201).json({ job });
  } catch (err) {
    res.status(500).json({ error: "Could not create job posting.", detail: err.message });
  }
});

// GET /api/jobs - list jobs; students see only eligible+active jobs, recruiters see their own, admin sees all
router.get("/", requireAuth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "student") {
      filter.isActive = true;
      const { cgpa, branch, graduationYear } = req.user.academicInfo || {};

      filter.$and = [
        {
          $or: [{ "eligibility.minCgpa": { $lte: cgpa || 0 } }, { "eligibility.minCgpa": 0 }],
        },
        {
          $or: [
            { "eligibility.branches": { $size: 0 } },
            { "eligibility.branches": branch },
          ],
        },
        {
          $or: [
            { "eligibility.graduationYear": null },
            { "eligibility.graduationYear": graduationYear },
          ],
        },
      ];
    } else if (req.user.role === "recruiter") {
      filter.recruiter = req.user.id;
    }
    // admin: no filter, sees everything

    const jobs = await JobPosting.find(filter)
      .populate("recruiter", "name company email")
      .sort({ createdAt: -1 });

    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch jobs.", detail: err.message });
  }
});

// GET /api/jobs/:id
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const job = await JobPosting.findById(req.params.id).populate(
      "recruiter",
      "name company email"
    );
    if (!job) return res.status(404).json({ error: "Job not found." });
    res.json({ job });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch job.", detail: err.message });
  }
});

export default router;
