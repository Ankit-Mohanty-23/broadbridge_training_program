import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      required: true,
    },

    // Student-only fields
    academicInfo: {
      degree: { type: String, default: "" },
      branch: { type: String, default: "" },
      graduationYear: { type: Number, default: null },
      cgpa: { type: Number, default: null },
    },
    skills: { type: [String], default: [] },
    resume: {
      filename: { type: String, default: "" },
      originalName: { type: String, default: "" },
      uploadedAt: { type: Date, default: null },
    },

    // Recruiter-only fields
    company: { type: String, default: "" },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
