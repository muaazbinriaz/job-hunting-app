const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db.js");
const authRoutes = require("./routes/auth.routes.js");
const profileRoutes = require("./routes/profile.routes.js");
const jobsRoutes = require("./routes/jobs.routes.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/cv", profileRoutes);
app.use("/api/jobs", jobsRoutes);

// Connect to DB then start server (local dev)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 8000;
  connectDB().then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
} else {
  // Production (Vercel) - connect DB on first request
  connectDB();
}

module.exports = app;
