// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages (what to show the user)
const ERROR_MESSAGES = {
  // When user can't login
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_ALREADY_EXISTS: "User with this email already exists",
  USER_NOT_FOUND: "User not found",
  TOKEN_MISSING: "Authorization token is missing",
  TOKEN_INVALID: "Authorization token is invalid",

  // When user submits bad data
  MISSING_FIELDS: "All required fields must be filled",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  INVALID_EMAIL: "Invalid email format",
  INVALID_FILE_TYPE: "Only PDF files are supported",
  FILE_TOO_LARGE: "File size exceeds 5MB limit",

  // CV Upload problems
  NO_FILE_UPLOADED: "No file was uploaded",
  CV_PARSING_FAILED: "Failed to parse CV",
  PROFILE_NOT_FOUND: "User profile not found",
  PROFILE_SAVE_FAILED: "Failed to save profile to database",

  // Server problems
  SERVER_ERROR: "Internal server error",
  MONGODB_CONNECTION_FAILED: "Failed to connect to MongoDB",
  MISSING_ENV_VARIABLE: "Required environment variable is missing",
};

// Success Messages (when things go right)
const SUCCESS_MESSAGES = {
  USER_REGISTERED: "User registered successfully",
  LOGIN_SUCCESS: "Login successful",
  CV_UPLOADED: "CV uploaded and parsed successfully",
  PROFILE_RETRIEVED: "Profile retrieved successfully",
  PROFILE_UPDATED: "Profile updated successfully",
};

// File Upload Settings
const FILE_CONFIG = {
  UPLOAD_DIR: "uploads", // Where to save PDFs
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB limit
  ALLOWED_MIME_TYPES: ["application/pdf"], // Only PDFs
  ALLOWED_EXTENSIONS: [".pdf"],
};

// JWT Token Settings
const JWT_CONFIG = {
  EXPIRATION: "7d", // Token expires in 7 days
};

// Database Settings
const DB_CONFIG = {
  CONNECTION_TIMEOUT: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Groq AI Settings
const GROQ_CONFIG = {
  MODEL: "llama-3.1-8b-instant", // Which AI model to use
  TEMPERATURE: 0.1, // Lower = more consistent
  MAX_TOKENS: 1024, // Max response length
  TIMEOUT: 30000, // 30 second timeout
};

// CV Parsing Limits
const CV_PARSING_CONFIG = {
  MAX_SKILLS: 20,
  MAX_EXPERIENCE: 10,
  MAX_EDUCATION: 5,
  MAX_CERTIFICATIONS: 10,
  PDF_TEXT_LENGTH_LIMIT: 5000,
  PDF_BUFFER_LIMIT: 10000,
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
};

// Password Rules
const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REQUIRE_LOWERCASE: true,
  REQUIRE_SPECIAL_CHARS: false,
};

// Validation Patterns
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
  URL: /^https?:\/\/.+/,
  PHONE: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

// Log Levels
const LOG_LEVELS = {
  ERROR: "ERROR",
  WARN: "WARN",
  INFO: "INFO",
  DEBUG: "DEBUG",
};

module.exports = {
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FILE_CONFIG,
  JWT_CONFIG,
  DB_CONFIG,
  GROQ_CONFIG,
  CV_PARSING_CONFIG,
  PAGINATION,
  PASSWORD_REQUIREMENTS,
  REGEX_PATTERNS,
  LOG_LEVELS,
};
