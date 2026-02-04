const express = require("express");
const router = express.Router();

const controller = require("../controllers/usersController");
const { verifyCaptcha } = require("../middleware/verifyCaptcha");
const { checkUserExists } = require("../middleware/checkUserExists");
const { validateBody } = require("../middleware/checkMissing");
const authMiddleware = require("../middleware/jwtAuth");

// ==================================================
// USER REGISTRATION & LOGIN
// ==================================================

// Register a new user (with CAPTCHA protection)
// Body: username, password, [email]
router.post("/register", verifyCaptcha, controller.createNewUser);

// Login an existing user
// Body: username, password
router.post("/login", controller.loginUser);

// ==================================================
// PASSWORD RESET
// ==================================================

// Request a password reset (sends email)
// Body: email
router.post("/forgot-password", controller.requestPasswordReset);

// Reset password using a valid token
// Query: token, Body: newPassword
router.post("/reset-password", controller.resetPassword);

// ==================================================
// LEADERBOARD
// ==================================================

// Get users leaderboard sorted by points
router.get("/leaderboard", controller.readLeaderboard);

const { ensureSelf } = require("../middleware/ensureSelf");

// ==================================================
// USER MANAGEMENT
// ==================================================

// Get all users
router.get("/", authMiddleware, controller.readAllUser);

// Update a user by ID (Self-only)
// Body: username
router.put(
  "/:user_id",
  authMiddleware,
  ensureSelf,
  checkUserExists,
  validateBody("username"),
  controller.updateUserById,
);

// Get a specific user by ID
router.get("/:user_id", authMiddleware, checkUserExists, controller.readUserById);

module.exports = router;
