import mongoose from "mongoose";

const { Schema } = mongoose;

const applicationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "JobPosting", required: true },
    status: {
      type: String,
      enum: ["applied", "shortlisted", "rejected", "selected"],
      default: "applied",
    },
    interviewSlot: {
      scheduledAt: { type: Date, default: null },
      mode: { type: String, default: "" }, // e.g. "Online" or "In-person, Room 204"
      notes: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// A student can only apply once to a given job
applicationSchema.index({ student: 1, job: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);
export default Application;
