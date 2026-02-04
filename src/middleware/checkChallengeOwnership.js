/**
 * @fileoverview Middleware to validate challenge ownership
 * @module middleware/checkChallengeOwnership
 * @requires ../models/challengesModel
 */

const model = require("../models/challengesModel");

/**
 * Ensures the requesting user is the creator of a challenge
 *
 * @function checkChallengeOwnership
 * @param {Object} req - Express request
 * @param {Object} req.params - URL params
 * @param {string} req.params.challenge_id - ID of challenge
 * @param {Object} req.body - Request body
 * @param {number} req.body.user_id - User performing action
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 * @returns {void} Calls next() if verified, else sends error
 * @throws {400} Invalid challenge or user ID
 * @throws {403} Forbidden if not challenge creator
 * @throws {404} Challenge not found
 * @throws {500} DB error
 */
module.exports.checkChallengeOwnership = (req, res, next) => {
  const challenge_id = parseInt(req.params.challenge_id);
  // Get user_id from JWT token (set by authMiddleware) instead of request body
  const user_id = req.user ? req.user.user_id : null;

  if (isNaN(challenge_id) || !user_id) {
    return res.status(400).json({ message: "Invalid challenge or user ID." });
  }

  model.getChallengeById(challenge_id, (err, results) => {
    if (err) {
      console.error("Error checking challenge ownership:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    if (results[0].creator_id !== user_id) {
      return res.status(403).json({ message: "Forbidden: Not the challenge creator." });
    }

    next();
  });
};