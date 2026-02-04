const express = require("express");
const router = express.Router();

const challengesController = require("../controllers/challengesController");
const completionsController = require("../controllers/completionsController");

const { checkChallengeOwnership } = require("../middleware/checkChallengeOwnership");
const { checkUserExists } = require("../middleware/checkUserExists");
const { validateBody } = require("../middleware/checkMissing");
const authMiddleware = require("../middleware/jwtAuth");

// ==================================================
// CHALLENGE ROUTES
// ==================================================

// Create a new challenge
// Required fields: description, points
router.post(
  "/",
  authMiddleware,
  validateBody("description", "points"),
  challengesController.createNewChallenge
);

// Get all challenges
router.get("/", challengesController.readAllChallenges);

// Update a specific challenge by ID (ownership protected)
// Required fields: description, points
router.put(
  "/:challenge_id",
  authMiddleware,
  validateBody("description", "points"),
  checkChallengeOwnership,
  challengesController.updateChallenge
);

// Delete a specific challenge by ID (ownership protected)
router.delete(
  "/:challenge_id",
  authMiddleware,
  checkChallengeOwnership,
  challengesController.deleteChallenge
);

// ==================================================
// COMPLETION ROUTES (nested under challenges)
// ==================================================

// Create a new completion for a challenge
// Required fields: details
router.post(
  "/:challenge_id/completions",
  authMiddleware,
  validateBody("details"),
  completionsController.createCompletion
);

// Get all completions for a challenge
router.get("/:challenge_id/completions", completionsController.getCompletions);

// Get my completions for a challenge
router.get(
  "/:challenge_id/my-completions",
  authMiddleware,
  completionsController.getUserCompletions
);

module.exports = router;