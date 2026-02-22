const { LOG_LEVELS } = require("./constants.js");

// Format log message with timestamp
const formatMessage = (level, message) => {
  const timestamp = new Date().toISOString();
  return `[${level}] ${timestamp} - ${message}`;
};

// Log INFO level
const info = (message, data) => {
  const formatted = formatMessage(LOG_LEVELS.INFO, message);
  console.log(formatted, data ? data : "");
};

// Log ERROR level
const error = (message, err) => {
  const formatted = formatMessage(LOG_LEVELS.ERROR, message);
  console.error(formatted);
  if (err) {
    console.error("Error Details:", err.message || err);
    console.error("Stack:", err.stack);
  }
};

// Log WARN level
const warn = (message, data) => {
  const formatted = formatMessage(LOG_LEVELS.WARN, message);
  console.warn(formatted, data ? data : "");
};

// Log DEBUG level (only if DEBUG=true)
const debug = (message, data) => {
  if (process.env.DEBUG === "true") {
    const formatted = formatMessage(LOG_LEVELS.DEBUG, message);
    console.log(formatted, data ? data : "");
  }
};

// Log API request
const logRequest = (method, path, userId) => {
  const userInfo = userId ? ` (User: ${userId})` : "";
  info(`→ ${method} ${path}${userInfo}`);
};

// Log API response
const logResponse = (method, path, statusCode, responseTime) => {
  const statusIcon = statusCode >= 200 && statusCode < 300 ? "✓" : "✗";
  info(`${statusIcon} ${method} ${path} - ${statusCode} (${responseTime}ms)`);
};

// Export all functions
module.exports = {
  formatMessage,
  info,
  error,
  warn,
  debug,
  logRequest,
  logResponse,
};
