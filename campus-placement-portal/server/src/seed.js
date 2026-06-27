// One-time seed script: creates the admin account (and optional demo
// student/recruiter accounts) directly in the database, bypassing the
// public /register route entirely — since that route no longer allows
// admin signups.
//
// Usage:
//   node src/seed.js
//
// Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env if present, otherwise
// falls back to the defaults below. Change the defaults or set the env
// vars before running in any environment that isn't purely local/dev.

import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import mongoose from "mongoose";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@campusplacement.local";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const ADMIN_NAME = process.env.ADMIN_NAME || "Placement Cell Admin";

const SEED_DEMO_ACCOUNTS = process.argv.includes("--with-demo");

async function upsertUser({ name, email, password, role, extra = {} }) {
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`[seed] skipped — ${email} already exists (${existing.role})`);
    return existing;
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashed, role, ...extra });
  console.log(`[seed] created ${role}: ${email} / ${password}`);
  return user;
}

async function run() {
  await connectDB();

  await upsertUser({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
  });

  if (SEED_DEMO_ACCOUNTS) {
    await upsertUser({
      name: "Demo Student",
      email: "student@campusplacement.local",
      password: "Demo1234!",
      role: "student",
      extra: {
        academicInfo: { degree: "B.Tech", branch: "CSE", graduationYear: 2027, cgpa: 8.4 },
        skills: ["JavaScript", "React", "Node.js"],
      },
    });

    await upsertUser({
      name: "Demo Recruiter",
      email: "recruiter@campusplacement.local",
      password: "Demo1234!",
      role: "recruiter",
      extra: { company: "Example Corp" },
    });
  }

  console.log("[seed] done.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("[seed] failed:", err);
  process.exit(1);
});
