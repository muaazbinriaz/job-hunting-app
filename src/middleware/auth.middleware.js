const jwt = require("jsonwebtoken");
const logger = require("../utils/logger.js");
const { ERROR_MESSAGES } = require("../utils/constants.js");
const { AuthenticationError } = require("../utils/errorHandler.js");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw AuthenticationError(ERROR_MESSAGES.TOKEN_MISSING);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw AuthenticationError(ERROR_MESSAGES.TOKEN_MISSING);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    logger.warn("Token verification failed", error.message);

    if (error && error.isOperational && error.statusCode === 401) {
      res.status(401).json({
        message: error.message,
        error: true,
      });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({
        message: ERROR_MESSAGES.TOKEN_INVALID,
        error: true,
      });
    } else if (error.name === "TokenExpiredError") {
      res.status(401).json({
        message: "Token has expired. Please login again.",
        error: true,
      });
    } else {
      res.status(401).json({
        message: ERROR_MESSAGES.TOKEN_INVALID,
        error: true,
      });
    }
  }
};

module.exports = { protect };
