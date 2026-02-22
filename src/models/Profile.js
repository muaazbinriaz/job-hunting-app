const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    cvUrl: String,
    summary: String,
    skills: [String],
    experience: [
      {
        title: String,
        company: String,
        duration: String,
      },
    ],
    education: [
      {
        degree: String,
        institution: String,
        year: String,
      },
    ],
    // Cached jobs to save API requests
    cachedJobs: { type: Array, default: [] },
    jobsCachedAt: { type: Date },
    jobsKeyword: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Profile", profileSchema);
