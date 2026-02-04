/**
 * @fileoverview Controller for managing user wellness challenges.
 * @module controllers/challengesController
 * @requires ../models/challengesModel
 */

const model = require("../models/challengesModel");

/**
 * Creates a new wellness challenge.
 *
 * @param {Object} req.body - { description, user_id, points }
 * @param {Object} res - Express response object
 * @returns {Object} Created challenge details
 * @throws 500 on database error
 */
module.exports.createNewChallenge = (req, res) => {
  if (req.body.points > 50) {
    return res.status(400).json({ message: "Points cannot exceed 50." });
  }

  const data = {
    description: req.body.description,
    user_id: req.user.user_id, // Use ID from JWT
    points: req.body.points,
  };

  model.insertSingle(data, (err, results) => {
    if (err) {
      console.error("Error createNewChallenge:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    res.status(201).json({
      challenge_id: results.insertId,
      description: data.description,
      creator_id: data.user_id,
      points: data.points,
    });
  });
};

/**
 * Retrieves all wellness challenges.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array<Object>} List of challenges
 * @throws 500 on database error
 */
module.exports.readAllChallenges = (req, res) => {
  model.readAllChallenges((err, results) => {
    if (err) {
      console.error("Error readAllChallenges:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    res.status(200).json(results);
  });
};

/**
 * Updates a wellness challenge by ID.
 *
 * @param {Object} req.params - { challenge_id }
 * @param {Object} req.body - { description, points, user_id }
 * @param {Object} res - Express response object
 * @returns {Object} Updated challenge details
 * @throws 500 on database error
 */
module.exports.updateChallenge = (req, res) => {
  if (req.body.points > 50) {
    return res.status(400).json({ message: "Points cannot exceed 50." });
  }

  const data = {
    challenge_id: parseInt(req.params.challenge_id),
    description: req.body.description,
    points: req.body.points,
    user_id: req.user.user_id, // Use ID from JWT
  };

  model.updateChallengeById(data, (err) => {
    if (err) {
      console.error("Error updateChallenge:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    res.status(200).json({
      challenge_id: data.challenge_id,
      description: data.description,
      creator_id: data.user_id,
      points: data.points,
    });
  });
};

/**
 * Deletes a wellness challenge by ID.
 *
 * @param {Object} req.params - { challenge_id }
 * @param {Object} res - Express response object
 * @returns {void} 204 No Content on success
 * @throws 404 if challenge not found
 * @throws 500 on database error
 */
module.exports.deleteChallenge = (req, res) => {
  const data = { challenge_id: parseInt(req.params.challenge_id) };

  model.deleteChallengeById(data, (err, results) => {
    if (err) {
      console.error("Error deleteChallenge:", err);
      return res.status(500).json({ message: "Internal server error." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Challenge not found." });
    }

    res.sendStatus(204);
  });
};