const express = require("express");
const router = express.Router();

const challengesRoutes = require("./challengesRoutes");
const usersRoutes = require("./usersRoutes");
const spaceRoutes = require("./spaceRoutes");

// ==================================================
// ROUTE PREFIXES
// ==================================================

// Routes for challenges
router.use("/challenges", challengesRoutes);

// Routes for users
router.use("/users", usersRoutes);

// Routes for space features
router.use("/space", spaceRoutes);

module.exports = router;