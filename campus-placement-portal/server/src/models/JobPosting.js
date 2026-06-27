import mongoose from "mongoose";

const { Schema } = mongoose;

const jobPostingSchema = new Schema(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    ctc: { type: Number, required: true },
    eligibility: {
      minCgpa: { type: Number, default: 0 },
      branches: { type: [String], default: [] }, // empty array = open to all branches
      graduationYear: { type: Number, default: null }, // null = open to all years
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const JobPosting = mongoose.model("JobPosting", jobPostingSchema);
export default JobPosting;
