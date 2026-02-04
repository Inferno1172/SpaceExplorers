/**
 * @fileoverview Middleware to fetch and attach user's discovered planets
 * @module middleware/getUserPlanets
 * @requires ../models/spaceModel
 */

const model = require("../models/spaceModel");

/**
 * Attaches a user's discovered planets to req.planets
 *
 * @function getUserPlanets
 * @middleware
 * @param {Object} req - Express request object
 * @param {Object} [req.user] - Preloaded user (from checkUserExists)
 * @param {number} [req.user.user_id] - User ID
 * @param {Object} [req.params] - URL parameters
 * @param {Object} [req.body] - Request body
 * @param {Object} [req.query] - Query parameters
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 * @returns {void} Calls next() after attaching planets array to req.planets
 * @throws {500} Internal server error if database fails
 */
module.exports.getUserPlanets = (req, res, next) => {
  // Step 1: Determine user_id from multiple sources
  const user_id =
    req.targetUser?.user_id ||
    req.user?.user_id ||
    req.params?.user_id ||
    req.body?.user_id ||
    req.query?.user_id;

  // Step 2: If no user_id, attach empty array and continue
  if (!user_id) {
    req.planets = [];
    return next();
  }

  // Step 3: Fetch discovered planets
  model.getUserPlanets({ user_id }, (err, planets) => {
    if (err) {
      console.error("Error getting user planets:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    // Step 4: Attach planets array and continue
    req.planets = planets || [];
    next();
  });
};