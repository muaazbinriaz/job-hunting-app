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

// Serve uploaded files publicly
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/cv", profileRoutes);
app.use("/api/jobs", jobsRoutes);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
module.exports = app;
// vercel dev
// vercel deploy
// vc deploy
// npm install serverless-http
