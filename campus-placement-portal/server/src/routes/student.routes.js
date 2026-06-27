import express from "express";
import User from "../models/User.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { uploadResume } from "../middleware/upload.js";

const router = express.Router();

// GET /api/students/me/profile
router.get("/me/profile", requireAuth, requireRole("student"), async (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/students/me/profile
router.put("/me/profile", requireAuth, requireRole("student"), async (req, res) => {
  try {
    const { academicInfo, skills } = req.body;
    const updates = {};
    if (academicInfo) updates.academicInfo = academicInfo;
    if (skills) updates.skills = skills;

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: "Could not update profile.", detail: err.message });
  }
});

// POST /api/students/me/resume
router.post(
  "/me/resume",
  requireAuth,
  requireRole("student"),
  uploadResume.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        {
          resume: {
            filename: req.file.filename,
            originalName: req.file.originalname,
            uploadedAt: new Date(),
          },
        },
        { new: true }
      );

      res.json({ user });
    } catch (err) {
      res.status(500).json({ error: "Resume upload failed.", detail: err.message });
    }
  }
);

// GET /api/students/me/resume - download own resume
router.get("/me/resume", requireAuth, requireRole("student"), async (req, res) => {
  if (!req.user.resume?.filename) {
    return res.status(404).json({ error: "No resume uploaded yet." });
  }
  res.sendFile(req.user.resume.filename, {
    root: "uploads/resumes",
  });
});

export default router;
