/**
 * @fileoverview Middleware to validate and preload user data
 * @module middleware/checkUserExists
 * @requires ../models/usersModel
 */

const usersModel = require("../models/usersModel");

/**
 * Ensures a user exists and attaches their data to req.user
 *
 * @function checkUserExists
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} [req.params] - URL parameters
 * @param {string} [req.params.user_id] - User ID from URL
 * @param {Object} [req.body] - Request body
 * @param {number} [req.body.user_id] - User ID from body
 * @param {Object} [req.query] - Query parameters
 * @param {string} [req.query.user_id] - User ID from query
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {void} Calls next() if user exists
 * @throws {400} Invalid user ID
 * @throws {404} User not found
 * @throws {500} Internal server error if database fails
 */
module.exports.checkUserExists = (req, res, next) => {
  const rawUserId = req.params.user_id || req.body.user_id || req.query?.user_id || req.user?.user_id;
  const user_id = parseInt(rawUserId, 10);

  // Step 1: Validate user_id
  if (isNaN(user_id)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  // Step 2: Query user by ID
  usersModel.readUserById({ user_id }, (err, userResults) => {
    if (err) {
      console.error("Error checking user existence:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (!userResults || userResults.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Step 3: Attach user data to req.targetUser
    req.targetUser = userResults[0];

    // Step 4: Continue to next middleware
    next();
  });
};