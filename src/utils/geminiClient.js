const { Groq } = require("groq-sdk");
const logger = require("./logger.js");

// Check if API key exists
if (!process.env.GROQ_API_KEY) {
  logger.error("GROQ_API_KEY not found in .env file");
}

// Create Groq client (like a connection to the AI service)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

logger.info("Groq API client initialized");

module.exports = { groq };
