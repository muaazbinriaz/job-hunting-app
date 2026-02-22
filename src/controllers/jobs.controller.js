const axios = require("axios");
const Profile = require("../models/Profile.js");
const logger = require("../utils/logger.js");

exports.getJobs = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });

    if (!profile || !profile.skills?.length) {
      return res.status(404).json({
        error: "No skills found. Please upload your CV first.",
      });
    }

    // Return cached jobs if available and less than 24 hours old
    if (profile.cachedJobs?.length && profile.jobsCachedAt) {
      const hoursSinceCached =
        (Date.now() - new Date(profile.jobsCachedAt)) / (1000 * 60 * 60);
      if (hoursSinceCached < 24) {
        return res.json({
          jobs: profile.cachedJobs,
          keywords: profile.jobsKeyword,
          cached: true,
        });
      }
    }

    // Clean skills - remove header words
    const cleanSkills = profile.skills
      .filter(
        (s) =>
          !["skills", "experience", "education", "summary"].includes(
            s.toLowerCase().trim(),
          ),
      )
      .map((s) => s.replace(/[^a-zA-Z0-9\s]/g, "").trim())
      .filter((s) => s.length > 2);

    // Use experience title if available, otherwise top skill
    const jobTitle =
      profile.experience?.[0]?.title || cleanSkills[0] || "developer";
    const query = `${jobTitle} developer`;

    const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: {
        query,
        page: "1",
        num_pages: "1",
        date_posted: "all",
      },
      headers: {
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPID_API_KEY,
      },
    });

    const jobs = (response.data.data || []).map((job) => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name || "Unknown",
      location: job.job_city
        ? `${job.job_city}, ${job.job_country}`
        : job.job_country || "Remote",
      isRemote: job.job_is_remote,
      salary: job.job_min_salary
        ? `$${Math.round(job.job_min_salary)} - $${Math.round(job.job_max_salary)}`
        : "Not specified",
      description: job.job_description?.substring(0, 200) + "...",
      url: job.job_apply_link,
      posted: job.job_posted_at_datetime_utc,
    }));

    // Cache jobs in profile to save API requests
    await Profile.findOneAndUpdate(
      { userId: req.userId },
      { cachedJobs: jobs, jobsCachedAt: new Date(), jobsKeyword: query },
    );

    res.json({ jobs, keywords: query });
  } catch (error) {
    logger.error("Jobs fetch error:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};
