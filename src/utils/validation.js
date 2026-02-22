const {
  REGEX_PATTERNS,
  PASSWORD_REQUIREMENTS,
  ERROR_MESSAGES,
} = require("./constants.js");

// Validate Email
const validateEmail = (email) => {
  if (!email || typeof email !== "string") {
    return { valid: false, error: ERROR_MESSAGES.MISSING_FIELDS };
  }
  const trimmed = email.trim().toLowerCase();
  if (!REGEX_PATTERNS.EMAIL.test(trimmed)) {
    return { valid: false, error: ERROR_MESSAGES.INVALID_EMAIL };
  }
  return { valid: true, value: trimmed };
};

// Validate Password
const validatePassword = (password) => {
  if (!password || typeof password !== "string") {
    return { valid: false, error: ERROR_MESSAGES.MISSING_FIELDS };
  }
  if (password.length < PASSWORD_REQUIREMENTS.MIN_LENGTH) {
    return {
      valid: false,
      error: `Password must be at least ${PASSWORD_REQUIREMENTS.MIN_LENGTH} characters`,
    };
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain uppercase letter" };
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain lowercase letter" };
  }
  if (PASSWORD_REQUIREMENTS.REQUIRE_NUMBERS && !/\d/.test(password)) {
    return { valid: false, error: "Password must contain number" };
  }
  return { valid: true };
};

// Validate Name
const validateName = (name) => {
  if (!name || typeof name !== "string") {
    return { valid: false, error: ERROR_MESSAGES.MISSING_FIELDS };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters" };
  }
  if (trimmed.length > 100) {
    return { valid: false, error: "Name must not exceed 100 characters" };
  }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return { valid: false, error: "Name contains invalid characters" };
  }
  return { valid: true, value: trimmed };
};

const validateRequiredFields = (data, requiredFields) => {
  const missing = requiredFields.filter(
    (field) => !data[field] || data[field].toString().trim() === "",
  );
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(", ")}`,
    };
  }
  return { valid: true };
};

module.exports = {
  validateEmail,
  validatePassword,
  validateName,
  validateRequiredFields,
};
