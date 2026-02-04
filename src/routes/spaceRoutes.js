const express = require("express");
const router = express.Router();

const controller = require("../controllers/spaceController");
const { checkUpgradeOwnership } = require("../middleware/checkUpgradeOwnership");
const { checkUserExists } = require("../middleware/checkUserExists");
const { getUserPlanets } = require("../middleware/getUserPlanets");
const { validateBody } = require("../middleware/checkMissing");
const authMiddleware = require("../middleware/jwtAuth");

// Protect every Space Route
router.use(authMiddleware)

// ==================================================
// USER SPACE JOURNEY
// ==================================================

// Get a user's space journey and progress
router.get(
  "/journey/:user_id",
  checkUserExists,
  getUserPlanets,
  controller.getUserJourney
);

// ==================================================
// PLANET DISCOVERY
// ==================================================

// Discover a new planet
// Required fields: planet_id
router.post(
  "/discover",
  checkUserExists,
  validateBody("planet_id"),
  controller.discoverPlanet
);

// ==================================================
// SPACECRAFT SHOP
// ==================================================

// Browse spacecraft shop (optional category filter)
router.get("/shop", getUserPlanets, controller.getSpacecraftShop);

// Purchase an upgrade from the shop
// Required fields: upgrade_id
router.post(
  "/shop/purchase",
  checkUserExists,
  validateBody("upgrade_id"),
  getUserPlanets,
  checkUpgradeOwnership,
  controller.purchaseUpgrade
);

// ==================================================
// USER SPACECRAFT
// ==================================================

// Get a user's spacecraft with all upgrades
router.get(
  "/spacecraft/:user_id",
  checkUserExists,
  controller.getUserSpacecraft
);

// Toggle equipped status of a spacecraft upgrade
// Required fields: upgrade_id, is_equipped
router.put(
  "/spacecraft/toggle",
  checkUserExists,
  validateBody("upgrade_id", "is_equipped"),
  controller.toggleUpgradeEquipped
);

// ==================================================
// USER ACHIEVEMENTS
// ==================================================

// Get all achievements earned by a user
router.get(
  "/achievements/:user_id",
  checkUserExists,
  controller.getUserAchievements
);

module.exports = router;