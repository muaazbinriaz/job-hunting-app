const fs = require("fs");
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

// Extract text from PDF using pdfjs-dist v5
const extractPDFText = async (filePath) => {
  try {
    const { getDocument } = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const data = new Uint8Array(fs.readFileSync(filePath));
    const doc = await getDocument({ data }).promise;
    let text = "";
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ");
    }
    return text.substring(0, 5000);
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

// Upload CV
exports.uploadCV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file" });
    if (req.file.mimetype !== "application/pdf") {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Only PDF files" });
    }

    const text = await extractPDFText(req.file.path);
    if (!text) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Could not read PDF" });
    }

    const parsed = await parseWithGroq(text);

    // Delete old CV file if exists
    const existingProfile = await Profile.findOne({ userId: req.userId });
    if (existingProfile?.cvUrl && fs.existsSync(existingProfile.cvUrl)) {
      fs.unlinkSync(existingProfile.cvUrl);
    }

    const profile = await Profile.findOneAndUpdate(
      { userId: req.userId },
      {
        userId: req.userId,
        cvUrl: req.file.path,
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
    if (req.file) fs.unlinkSync(req.file.path);
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

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndDelete({ userId: req.userId });
    if (profile?.cvUrl && fs.existsSync(profile.cvUrl)) {
      fs.unlinkSync(profile.cvUrl);
    }
    res.json({ message: "Deleted" });
  } catch (error) {
    logger.error("Error:", error);
    res.status(500).json({ error: "Error" });
  }
};
