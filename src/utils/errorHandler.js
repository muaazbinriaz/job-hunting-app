// Define error types as plain objects
const ERROR_TYPES = {
  VALIDATION: { statusCode: 400 },
  AUTHENTICATION: { statusCode: 401 },
  AUTHORIZATION: { statusCode: 403 },
  NOT_FOUND: { statusCode: 404 },
  CONFLICT: { statusCode: 409 },
  DATABASE: { statusCode: 500 },
  EXTERNAL_SERVICE: { statusCode: 503 },
  FILE_UPLOAD: { statusCode: 400 },
};

// Create an error object
function createError(type, message, extra = {}) {
  const base = ERROR_TYPES[type] || { statusCode: 500 };
  return {
    message,
    statusCode: base.statusCode,
    isOperational: true, // mark as safe/expected error
    ...extra, // optional extra info
  };
}

// Check if error is operational
const isOperationalError = (error) => !!error.isOperational;

// Get response for sending to client
const getErrorResponse = (error) => {
  if (error && error.statusCode && error.message) {
    return { statusCode: error.statusCode, message: error.message };
  }
  return { statusCode: 500, message: "Internal server error" };
};

// Example usage helpers
const ValidationError = (msg) => createError("VALIDATION", msg);
const AuthenticationError = (msg = "Authentication failed") =>
  createError("AUTHENTICATION", msg);
const AuthorizationError = (msg = "Access denied") =>
  createError("AUTHORIZATION", msg);
const NotFoundError = (msg) => createError("NOT_FOUND", msg);
const ConflictError = (msg) => createError("CONFLICT", msg);
const DatabaseError = (msg, extra) => createError("DATABASE", msg, extra);
const ExternalServiceError = (service, msg, extra) =>
  createError("EXTERNAL_SERVICE", `${service} error: ${msg}`, extra);
const FileUploadError = (msg) => createError("FILE_UPLOAD", msg);

module.exports = {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  ExternalServiceError,
  FileUploadError,
  isOperationalError,
  getErrorResponse,
};
