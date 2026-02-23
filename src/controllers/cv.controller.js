const pdfParse = require("pdf-parse");
const Profile = require("../models/Profile.js");
const { groq } = require("../utils/geminiClient.js");
const logger = require("../utils/logger.js");

// Simple fallback if AI fails
const parseSimple = (text) => {
  const skills = (text.match(/skills?[:\s]+([^\n]+)/gi) || [])
    .flatMap((s) => s.split(/[,;]/))
    .filter((s) => s.trim())
    .slice(0, 5);

  return {
    skills: skills.map((s) => s.trim()),
    experience: [],
    education: [],
    summary: text.substring(0, 300),
  };
};

const extractPDFText = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.text.substring(0, 5000);
  } catch (error) {
    logger.error("PDF extraction failed:", error);
    return "";
  }
};

// Parse with Groq AI
const parseWithGroq = async (text) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Extract CV data and return ONLY JSON with no extra text: {"skills": [], "experience": [{"title": "", "company": "", "duration": ""}], "education": [{"degree": "", "institution": "", "year": ""}], "summary": ""}. Extract ALL skills mentioned. CV: ${text.substring(0, 3000)}`,
        },
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 1000,
    });

    const text_content = response.choices[0]?.message?.content || "";
    const jsonMatch = text_content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    logger.error("Groq failed, using simple parse");
  }
  return parseSimple(text);
};

exports.uploadCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files" });
    }

    // Use buffer directly (memory storage - no disk needed)
    const text = await extractPDFText(req.file.buffer);
    if (!text) {
      return res.status(400).json({ error: "Could not read PDF" });
    }

    const parsed = await parseWithGroq(text);

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        cvUrl: "memory-upload",
        summary: parsed.summary || "",
        skills: parsed.skills || [],
        experience: parsed.experience || [],
        education: parsed.education || [],
        cachedJobs: [],
        jobsCachedAt: null,
      },
      { upsert: true, new: true },
    );

    res.json({ message: "CV uploaded successfully", profile });
  } catch (error) {
    logger.error("Upload error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

// Get profile
exports.getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.userId });
    if (!profile) return res.status(404).json({ error: "No CV uploaded" });
    res.json({ profile });
  } catch (error) {
    logger.error("Error:", error);
    res.status(500).json({ error: "Error" });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    await Profile.findOneAndDelete({ userId: req.userId });
    res.json({ message: "Deleted" });
  } catch (error) {
    logger.error("Error:", error);
    res.status(500).json({ error: "Error" });
  }
};
