const express = require("express");
const {
  uploadCV,
  getProfile,
  deleteProfile,
} = require("../controllers/cv.controller.js");
const { protect } = require("../middleware/auth.middleware.js");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/upload-cv", protect, upload.single("cv"), uploadCV);
router.get("/profile", protect, getProfile);
router.delete("/profile", protect, deleteProfile);

module.exports = router;
