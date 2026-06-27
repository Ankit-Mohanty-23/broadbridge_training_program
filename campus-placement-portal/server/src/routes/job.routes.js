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

      // Only apply an eligibility condition when the student has actually filled
      // that field in. A fresh profile (no data) should see ALL active jobs.
      // A fully-filled profile sees only jobs they genuinely qualify for.
      const andConditions = [];

      // CGPA: only filter if the student has a CGPA recorded
      if (cgpa) {
        andConditions.push({
          $or: [
            { "eligibility.minCgpa": 0 },          // no minimum set
            { "eligibility.minCgpa": { $lte: cgpa } }, // student meets the minimum
          ],
        });
      }

      // Branch: only filter if the student has a branch recorded
      if (branch) {
        andConditions.push({
          $or: [
            { "eligibility.branches": { $size: 0 } }, // open to all branches
            { "eligibility.branches": branch },        // student's branch is listed
          ],
        });
      }

      // Graduation year: only filter if the student has a graduation year recorded
      if (graduationYear) {
        andConditions.push({
          $or: [
            { "eligibility.graduationYear": null },       // no year restriction
            { "eligibility.graduationYear": graduationYear },
          ],
        });
      }

      if (andConditions.length > 0) {
        filter.$and = andConditions;
      }
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
