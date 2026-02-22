const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger.js");
const validator = require("../utils/validation.js");
const {
  ValidationError,
  AuthenticationError,
  ConflictError,
  DatabaseError,
} = require("../utils/errorHandler.js");
const {
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  JWT_CONFIG,
} = require("../utils/constants.js");

// Create JWT token with userId payload
const createJWT = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: JWT_CONFIG.EXPIRATION,
  });
};

// Build user response
const buildUserResponse = (user) => {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };
};

// REGISTER
const register = async (req, res) => {
  try {
    logger.info("Register endpoint hit");
    const { name, email, password } = req.body;

    // Validate input
    const fieldsCheck = validator.validateRequiredFields(req.body, [
      "name",
      "email",
      "password",
    ]);
    if (!fieldsCheck.valid) {
      throw ValidationError(fieldsCheck.error);
    }

    // Validate email
    const emailCheck = validator.validateEmail(email);
    if (!emailCheck.valid) {
      throw ValidationError(emailCheck.error);
    }

    // Validate password
    const passwordCheck = validator.validatePassword(password);
    if (!passwordCheck.valid) {
      throw ValidationError(passwordCheck.error);
    }

    // Validate name
    const nameCheck = validator.validateName(name);
    if (!nameCheck.valid) {
      throw ValidationError(nameCheck.error);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: emailCheck.value });
    if (existingUser) {
      throw ConflictError(ERROR_MESSAGES.USER_ALREADY_EXISTS);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  Create user in database
    const newUser = await User.create({
      name: nameCheck.value,
      email: emailCheck.value,
      password: hashedPassword,
    });

    // Generate JWT token
    const token = createJWT(newUser._id.toString());

    // Send response
    res.status(201).json({
      message: SUCCESS_MESSAGES.USER_REGISTERED,
      token,
      user: buildUserResponse(newUser),
    });
  } catch (error) {
    // Property-based error checks instead of instanceof
    if (error && error.isOperational && error.statusCode === 400) {
      res.status(error.statusCode).json({
        message: error.message,
        error: true,
      });
    } else if (error && error.isOperational && error.statusCode === 409) {
      res.status(error.statusCode).json({
        message: error.message,
        error: true,
      });
    } else if (error && error.isOperational && error.statusCode === 500) {
      res.status(500).json({
        message: "Failed to create user",
        error: true,
      });
    } else {
      res.status(500).json({
        message: ERROR_MESSAGES.SERVER_ERROR,
        error: true,
      });
    }
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const fieldsCheck = validator.validateRequiredFields(req.body, [
      "email",
      "password",
    ]);
    if (!fieldsCheck.valid) {
      throw ValidationError(fieldsCheck.error);
    }

    // Validate email
    const emailCheck = validator.validateEmail(email);
    if (!emailCheck.valid) {
      throw ValidationError(emailCheck.error);
    }

    logger.debug("Input validation passed", { email });

    //  Find user by email
    const user = await User.findOne({ email: emailCheck.value });

    if (!user) {
      throw AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Compare passwords
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw AuthenticationError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Create JWT token
    const token = createJWT(user._id.toString());

    // Send response
    res.status(200).json({
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    logger.error("Login failed", error);
    if (error && error.isOperational && error.statusCode === 400) {
      res.status(error.statusCode).json({
        message: error.message,
        error: true,
      });
    } else if (error && error.isOperational && error.statusCode === 401) {
      res.status(error.statusCode).json({
        message: error.message,
        error: true,
      });
    } else {
      res.status(500).json({
        message: ERROR_MESSAGES.SERVER_ERROR,
        error: true,
      });
    }
  }
};

module.exports = {
  register,
  login,
};
