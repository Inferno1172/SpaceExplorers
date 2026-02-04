/**
 * @fileoverview Controller for managing user challenge completions.
 * @module controllers/completionsController
 * @requires ../models/completionsModel
 */

const model = require("../models/completionsModel");

/**
 * Records a user's completion of a wellness challenge.
 *
 * @param {Object} req.params - { challenge_id } from URL
 * @param {Object} req.body - { details? } submitted by user
 * @param {Object} res - Express response object
 * @returns {Object} Created completion record
 * @throws 404 if challenge not found
 * @throws 500 on database error
 */
module.exports.createCompletion = (req, res) => {
  // Prepare data for insertion
  const data = {
    challenge_id: parseInt(req.params.challenge_id), // Convert challenge_id to integer
    user_id: req.user.user_id, // Use ID from JWT
    details: req.body.details, // Optional details about the completion
  };

  // Insert completion record into database
  model.insertSingle(data, (err, results) => {
    if (err) {
      console.error("Error createCompletion:", err); // Log for debugging
      return res.status(500).json({ message: "Internal server error." });
    }

    // Handle case where challenge ID does not exist
    if (results.challengeNotFound) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    // Return created completion record
    res.status(201).json({
      completion_id: results.insertId,
      challenge_id: data.challenge_id,
      user_id: data.user_id,
      details: data.details,
    });
  });
};

/**
 * Retrieves all completion attempts for a specific challenge.
 *
 * @param {Object} req.params - { challenge_id } from URL
 * @param {Object} res - Express response object
 * @returns {Array<Object>} Completion records
 * @throws 404 if no completions found
 * @throws 500 on database error
 */
module.exports.getCompletions = (req, res) => {
  // Prepare query parameter
  const data = { challenge_id: parseInt(req.params.challenge_id) };

  // Fetch completions from database
  model.getCompletionsByChallenge(data, (err, results) => {
    if (err) {
      console.error("Error getCompletions:", err); // Log for debugging
      return res.status(500).json({ message: "Internal server error." });
    }

    // Handle case where no completions exist
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempts found for this challenge." });
    }

    // Return list of completion records
    res.status(200).json(results);
  });
};

/**
 * Retrieves all completion attempts for a specific challenge by the authenticated user.
 *
 * @param {Object} req.params - { challenge_id } from URL
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Array<Object>} Completion records
 * @throws 404 if no completions found
 * @throws 500 on database error
 */
module.exports.getUserCompletions = (req, res) => {
  // Prepare query parameters
  const data = {
    challenge_id: parseInt(req.params.challenge_id),
    user_id: req.user.user_id, // Use ID from JWT
  };

  // Fetch user-specific completions from database
  model.getCompletionsByUser(data, (err, results) => {
    if (err) {
      console.error("Error getUserCompletions:", err); // Log for debugging
      return res.status(500).json({ message: "Internal server error." });
    }

    // Handle case where no completions exist for this user
    if (results.length === 0) {
      return res
        .status(404)
        .json({ message: "No attempts found for this challenge by you." });
    }

    // Return user's completion records
    res.status(200).json(results);
  });
};