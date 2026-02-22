const express = require("express");
const { getJobs } = require("../controllers/jobs.controller.js");
const { protect } = require("../middleware/auth.middleware.js");

const router = express.Router();

router.get("/", protect, getJobs);

module.exports = router;
