/**
 * @fileoverview Controller for user account management, including registration,
 * login, profile updates, password reset, and leaderboard functionality.
 * @module controllers/usersController
 * @requires ../models/usersModel
 * @requires ../services/emailService
 * @requires bcrypt
 * @requires crypto
 */

const model = require("../models/usersModel");
const emailService = require("../services/emailService");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/**
 * POST /users/register
 * Registers a new user with username, password, and optional email
 *
 * @function createNewUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user registration details
 * @param {string} req.body.username - Desired username (must be unique)
 * @param {string} req.body.password - User password (minimum 8 characters)
 * @param {string} [req.body.email] - Optional email address
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created user details
 * @throws {400} Missing username or password if required fields not provided
 * @throws {400} Password must be at least 8 characters if password too short
 * @throws {409} Username already exists if username is taken
 * @throws {500} Internal server error if database operation or hashing fails
 */
module.exports.createNewUser = (req, res) => {
  // Validate required fields
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: "Missing username or password." });
  }

  if (req.body.password.length < 8) {
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters." });
  }

  const saltRounds = 10;
  // Hash the password for secure storage
  bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    const data = {
      username: req.body.username,
      password: hash,
      email: req.body.email || null,
    };

    // Insert the new user into the database
    model.insertSingle(data, (err, results) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ message: "Username already exists." });
        }
        return res.status(500).json({ message: "Internal server error." });
      }

      res.status(201).json({
        user_id: results.insertId,
        username: data.username,
        email: data.email,
        points: 0, // New users start with 0 points
      });
    });
  });
};

/**
 * POST /users/login
 * Authenticates a user and returns their profile details
 *
 * @function loginUser
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing login credentials
 * @param {string} req.body.username - Username
 * @param {string} req.body.password - Password
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with authenticated user details
 * @throws {400} Missing username or password if required fields not provided
 * @throws {401} Invalid username or password if credentials don't match
 * @throws {500} Internal server error if database operation or password comparison fails
 */
module.exports.loginUser = (req, res) => {
  // Validate login fields
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ message: "Missing username or password." });
  }

  // Retrieve user by username
  model.readUserByUsername(req.body.username, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    if (results.length === 0)
      return res.status(401).json({ message: "Invalid username or password." });

    const user = results[0];

    // Compare provided password with hashed password in DB
    bcrypt.compare(req.body.password, user.password, (err, isMatch) => {
      if (err)
        return res.status(500).json({ message: "Internal server error." });
      if (!isMatch)
        return res
          .status(401)
          .json({ message: "Invalid username or password." });

      // Generate JWT Token
      const payload = {
        user_id: user.user_id,
        username: user.username,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.status(200).json({
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        points: user.points,
        token: token,
        message: "Login successful!",
      });
    });
  });
};

/**
 * GET /users
 * Retrieves all users from the database
 *
 * @function readAllUser
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array<Object>} JSON array containing all users
 * @throws {500} Internal server error if database operation fails
 */
module.exports.readAllUser = (req, res) => {
  model.readAllUser((err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error." });
    res.status(200).json(results);
  });
};

/**
 * GET /users/:user_id
 * Retrieves a specific user by their ID
 *
 * @function readUserById
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.user_id - ID of the user to retrieve
 * @param {Object} req.user - User object attached by authentication middleware
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with user details
 * @throws {500} Internal server error if middleware fails
 */
module.exports.readUserById = (req, res) => {
  const data = { user_id: req.user.user_id };

  model.readUserById(data, (err, results) => {
    if (err) {
      console.error("Error readUserById:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(results[0]);
  });
};

/**
 * PUT /users/:user_id
 * Updates a user's username and points
 *
 * @function updateUserById
 * @param {Object} req - Express request object
 * @param {Object} req.params - URL parameters
 * @param {string} req.params.user_id - ID of the user to update
 * @param {Object} req.body - Request body containing updated user details
 * @param {string} req.body.username - Updated username
 * @param {number} req.body.points - Updated points value
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated user details
 * @throws {409} Username already exists if new username is taken
 * @throws {500} Internal server error if database operation fails
 */
module.exports.updateUserById = (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  const data = {
    user_id,
    username: req.body.username,
    points: req.body.points,
  };

  model.updateUserById(data, (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(409).json({ message: "Username already exists." });
      return res.status(500).json({ message: "Internal server error." });
    }
    res.status(200).json(data);
  });
};

/**
 * GET /users/leaderboard
 * Retrieves the leaderboard showing users ranked by points
 *
 * @function readLeaderboard
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array<Object>} JSON array of users ranked by points
 * @throws {500} Internal server error if database operation fails
 */
module.exports.readLeaderboard = (req, res) => {
  model.readLeaderboard((err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    // Add rank property based on points
    const rankedResults = results.map((row, index) => ({
      rank: index + 1,
      username: row.username,
      points: row.points,
    }));

    res.status(200).json(rankedResults);
  });
};

/**
 * POST /users/reset-password
 * Resets a user's password using a valid reset token
 *
 * @function resetPassword
 * @param {Object} req - Express request object
 * @param {Object} req.query - Query parameters
 * @param {string} req.query.token - Password reset token
 * @param {Object} req.body - Request body containing new password
 * @param {string} req.body.newPassword - New password (minimum 8 characters)
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming password reset
 * @throws {400} Token and new password are required
 * @throws {400} Password too short
 * @throws {400} Invalid or expired reset token
 * @throws {500} Internal server error
 */
module.exports.resetPassword = (req, res) => {
  if (!req.query.token || !req.body.newPassword)
    return res
      .status(400)
      .json({ message: "Token and new password are required." });

  if (req.body.newPassword.length < 8)
    return res
      .status(400)
      .json({ message: "Password must be at least 8 characters." });

  const token = req.query.token;

  // Fetch user by reset token
  model.readUserByResetToken(token, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error." });
    if (results.length === 0)
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token." });

    const user = results[0];

    // Hash new password before saving
    bcrypt.hash(req.body.newPassword, 10, (err, hash) => {
      if (err)
        return res.status(500).json({ message: "Internal server error." });

      const data = { password: hash, user_id: user.user_id };

      // Update password and remove reset token
      model.updatePasswordAndClearResetToken(data, (err) => {
        if (err)
          return res.status(500).json({ message: "Internal server error." });
        res.status(200).json({ message: "Password reset successful." });
      });
    });
  });
};

/**
 * POST /users/request-reset
 * Initiates a password reset request by sending a reset link via email
 *
 * @function requestPasswordReset
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body containing user's email
 * @param {string} req.body.email - Email address to send reset link to
 * @param {Object} res - Express response object
 * @returns {Object} JSON response (always returns success for security)
 * @throws {400} Email is required
 * @throws {500} Internal server error
 */
module.exports.requestPasswordReset = (req, res) => {
  if (!req.body.email)
    return res.status(400).json({ message: "Email is required." });

  const email = req.body.email;

  // Fetch user by email
  model.readUserByEmail(email, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    // Always return success to avoid email enumeration
    if (results.length === 0)
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link has been sent." });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour expiry

    const data = { token: resetToken, expiry, email };

    // Save token in DB
    model.saveResetToken(data, (err) => {
      if (err)
        return res.status(500).json({ message: "Internal server error." });

      // Send email with reset link
      emailService
        .sendPasswordResetEmail(email, resetToken)
        .then(() => {
          res.status(200).json({
            message: "If that email exists, a reset link has been sent.",
          });
        })
        .catch(() => res.status(500).json({ message: "Error sending email." }));
    });
  });
};