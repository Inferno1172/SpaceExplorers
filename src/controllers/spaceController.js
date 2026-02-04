/**
 * @fileoverview Controller for managing the space exploration game mechanics, 
 * including user journeys, planet discovery, spacecraft upgrades, and achievements.
 * @module controllers/spaceController
 * @requires ../models/spaceModel
 * @requires ../models/usersModel
 * @requires ../utils/gameMechanics/getNextPlanet
 * @requires ../utils/gameMechanics/calculatePointsMultiplier
 */

// Import space-related database operations
const model = require("../models/spaceModel");

// Import user-related database operations
const usersModel = require("../models/usersModel");

// Import game utility functions
const {
  getNextPlanet,
  calculatePointsMultiplier,
  awardPoints,
} = require("../utils/gameMechanics");

/**
 * INTERNAL: Check and award eligible achievements for a user.
 *
 * Iterates over all achievements the user is eligible for and awards them.
 * Also updates user points for the achievement rewards.
 *
 * @param {number} user_id - ID of the user
 */
function checkSpaceAchievements(user_id) {
  // Fetch user statistics to determine eligible achievements
  model.getUserStats({ user_id }, (err, stats) => {
    if (err || stats.length === 0) return;

    const userStats = stats[0];

    // Determine which achievements the user qualifies for
    model.getEligibleAchievements(userStats, (err, achievements) => {
      if (err || achievements.length === 0) return;

      // Retrieve current user data for point updates
      usersModel.readUserById({ user_id }, (err, userResults) => {
        if (err || userResults.length === 0) return;

        let user = userResults[0];
        let bonusPoints = 0;
        let completed = 0;

        // Award each achievement and sum up points
        achievements.forEach((achievement) => {
          model.awardAchievement(
            { user_id, achievement_id: achievement.achievement_id },
            (err) => {
              completed++;

              if (!err || err.code === "ER_DUP_ENTRY") {
                bonusPoints += achievement.reward_points || 0;
              } else {
                console.error("Error awarding achievement:", err);
              }

              // Once all achievements are processed, update user points
              if (completed === achievements.length && bonusPoints > 0) {
                usersModel.updateUserById(
                  {
                    user_id,
                    username: user.username,
                    points: user.points + bonusPoints,
                  },
                  (err) => {
                    if (err)
                      console.error("Error updating achievement rewards:", err);
                  }
                );
              }
            }
          );
        });
      });
    });
  });
}

/**
 * GET /space/journey/:user_id
 * Retrieve a user's space exploration journey.
 *
 * @param {Object} req.user - Authenticated user object
 * @param {Array<Object>} req.planets - User's discovered planets
 * @param {Object} res - Express response object
 * @returns {Object} Journey data with next planet, discovered planets, and progress
 * @throws 500 on database error
 */
module.exports.getUserJourney = (req, res) => {
  const user = req.targetUser; // Use target user from checkUserExists
  const discoveredPlanets = req.planets;

  // Fetch all planets to calculate next exploration target
  model.getAllPlanets((err, allPlanets) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    // Determine the next planet the user can attempt to discover
    const nextPlanet = getNextPlanet(discoveredPlanets, allPlanets);

    res.status(200).json({
      user: {
        user_id: user.user_id,
        username: user.username,
        fuel: user.points, // Fuel corresponds to user's points
      },
      discoveredPlanets,
      next_planet: nextPlanet,
      can_discover_next: nextPlanet
        ? user.points >= nextPlanet.fuel_required
        : false,
      total_planets: allPlanets.length,
      discovery_progress: `${discoveredPlanets.length}/${allPlanets.length}`,
    });
  });
};

/**
 * POST /space/discover
 * Discover a new planet for a user.
 *
 * @param {Object} req.body - { user_id, planet_id }
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Object} Discovery result including new fuel and bonus reward
 * @throws 400 if not enough fuel
 * @throws 404 if planet not found
 * @throws 409 if planet already discovered
 * @throws 500 on database error
 */
module.exports.discoverPlanet = (req, res) => {
  const user_id = req.user.user_id; // Get from JWT
  const { planet_id } = req.body;

  // Check if user has already discovered the planet
  model.checkPlanetDiscovery({ user_id, planet_id }, (err, results) => {
    if (err) return res.status(500).json({ message: "Internal server error." });
    if (results.length > 0)
      return res.status(409).json({ message: "Planet already discovered!" });

    // Fetch planet details to validate discovery
    model.getPlanetById({ planet_id }, (err, planetResults) => {
      if (err || planetResults.length === 0)
        return res.status(404).json({ message: "Planet not found." });

      const planet = planetResults[0];
      const user = req.targetUser; // This should be the same as req.user since checkUserExists is likely on the same ID

      // Ensure user has enough fuel to discover the planet
      if (user.points < planet.fuel_required)
        return res.status(400).json({
          message: "Not enough fuel!",
          required: planet.fuel_required,
          current: user.points,
        });

      // Record the discovery in database
      model.discoverPlanet({ user_id, planet_id }, (err) => {
        if (err)
          return res.status(500).json({ message: "Internal server error." });

      model.getUserUpgrades({ user_id }, (err, upgrades) => {
        if (err) return res.status(500).json({ message: "Internal server error." });

        const multiplier = calculatePointsMultiplier(upgrades);
        const finalReward = awardPoints(planet.discovery_reward, multiplier);
        const newPoints = user.points - planet.fuel_required + finalReward;

        // Update user's fuel/points after discovery
        usersModel.updateUserById(
          { user_id, username: user.username, points: newPoints },
          (err) => {
            if (err) console.error("Error updating points:", err);

            // Check if new achievements unlocked due to discovery
            checkSpaceAchievements(user_id);

            res.status(201).json({
              message: `Discovered ${planet.name}!`,
              planet,
              bonus_reward: finalReward,
              new_fuel_total: newPoints,
            });
          }
        );
      });
      });
    });
  });
};

/**
 * GET /space/shop
 * Retrieve spacecraft shop items with optional user-specific data.
 *
 * @param {Object} req.query - { user_id?, category? }
 * @param {Array<Object>} req.planets - User's discovered planets (optional)
 * @param {Object} res - Express response object
 * @returns {Array<Object>} Shop items with ownership and unlock status
 * @throws 500 on database error
 */
module.exports.getSpacecraftShop = (req, res) => {
  const user_id = req.user ? req.user.user_id : null; // Get from JWT if authenticated
  const category = req.query.category;

  // Fetch all shop upgrades in the requested category
  model.getSpacecraftUpgrades({ category }, (err, upgrades) => {
    if (err) return res.status(500).json({ message: "Internal server error." });
    if (!user_id || !req.planets) return res.status(200).json(upgrades);

    const planetsDiscovered = req.planets.length;

    // Fetch upgrades already owned by the user
    model.getUserUpgrades({ user_id }, (err, ownedUpgrades) => {
      if (err)
        return res.status(500).json({ message: "Internal server error." });

      const ownedIds = ownedUpgrades.map((u) => u.upgrade_id);

      // Combine ownership and unlock status into shop items
      const shopItems = upgrades.map((upgrade) => ({
        ...upgrade,
        is_owned: ownedIds.includes(upgrade.upgrade_id),
        is_locked: planetsDiscovered < upgrade.unlock_requirement,
        unlock_progress: `${planetsDiscovered}/${upgrade.unlock_requirement}`,
      }));

      res.status(200).json(shopItems);
    });
  });
};

/**
 * POST /space/purchase
 * Purchase a spacecraft upgrade for a user.
 *
 * @param {Object} req.body - { user_id, upgrade_id }
 * @param {Object} req.user - Authenticated user object
 * @param {Array<Object>} req.planets - User's discovered planets
 * @param {Object} res - Express response object
 * @returns {Object} Purchase result including remaining fuel
 * @throws 400 if not enough fuel
 * @throws 403 if upgrade locked
 * @throws 500 on database error
 */
module.exports.purchaseUpgrade = (req, res) => {
  const user_id = req.user.user_id; // Get from JWT
  const { upgrade_id } = req.body;

  model.getUpgradeById({ upgrade_id }, (err, upgradeResults) => {
    const upgrade = upgradeResults[0];
    const user = req.targetUser; // Found by checkUserExists

    // Check unlock requirements based on planets discovered
    if (req.planets.length < upgrade.unlock_requirement)
      return res.status(403).json({
        message: "Upgrade locked!",
        required_planets: upgrade.unlock_requirement,
        current_planets: req.planets.length,
      });

    // Ensure user has enough fuel
    if (user.points < upgrade.price)
      return res.status(400).json({
        message: "Not enough fuel!",
        required: upgrade.price,
        current: user.points,
      });

    const newPoints = user.points - upgrade.price;

    // Deduct fuel and update user points
    usersModel.updateUserById(
      { user_id, username: user.username, points: newPoints },
      (err) => {
        if (err)
          return res.status(500).json({ message: "Internal server error." });

        // Add the purchased upgrade to user's inventory
        model.addUpgradeToUser({ user_id, upgrade_id }, (err) => {
          if (err)
            return res.status(500).json({ message: "Internal server error" });

          // Check for achievements unlocked after purchase
          checkSpaceAchievements(user_id);

          res.status(201).json({
            message: "Upgrade purchased!",
            upgrade: upgrade.name,
            cost: upgrade.price,
            remaining_fuel: newPoints,
          });
        });
      }
    );
  });
};

/**
 * GET /space/ship/:user_id
 * Retrieve user's spacecraft with equipped upgrades.
 *
 * @param {Object} req.params - { user_id }
 * @param {Object} res - Express response object
 * @returns {Object} Spacecraft data including upgrades and points multiplier
 * @throws 500 on database error
 */
module.exports.getUserSpacecraft = (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);

  model.getUserUpgrades({ user_id }, (err, upgrades) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    // Calculate points multiplier from equipped upgrades
    const multiplier = calculatePointsMultiplier(upgrades);

    // Group upgrades by category for easier UI handling
    const grouped = {
      engine: upgrades.filter((u) => u.category === "engine"),
      hull: upgrades.filter((u) => u.category === "hull"),
      cosmetic: upgrades.filter((u) => u.category === "cosmetic"),
      special: upgrades.filter((u) => u.category === "special"),
    };

    res.status(200).json({
      upgrades: grouped,
      total_upgrades: upgrades.length,
      points_multiplier: multiplier.toFixed(2) + "x",
      equipped_count: upgrades.filter((u) => u.is_equipped).length,
    });
  });
};

/**
 * PUT /space/upgrade/toggle
 * Equip or unequip a spacecraft upgrade.
 *
 * @param {Object} req.body - { user_id, upgrade_id, is_equipped }
 * @param {Object} res - Express response object
 * @returns {Object} Message indicating new upgrade status
 * @throws 404 if upgrade not found
 * @throws 500 on database error
 */
module.exports.toggleUpgradeEquipped = (req, res) => {
  const user_id = req.user.user_id; // Get from JWT
  const { upgrade_id, is_equipped } = req.body;

  model.toggleUpgradeEquipped(
    { user_id, upgrade_id, is_equipped },
    (err, results) => {
      if (err)
        return res.status(500).json({ message: "Internal server error." });
      if (results.affectedRows === 0)
        return res.status(404).json({ message: "Upgrade not found." });

      res.status(200).json({
        message: is_equipped ? "Upgrade equipped!" : "Upgrade unequipped!",
      });
    }
  );
};

/**
 * GET /space/achievements/:user_id
 * Retrieve all achievements and user's progress.
 *
 * @param {Object} req.params - { user_id }
 * @param {Object} res - Express response object
 * @returns {Object} Achievement list with earned status and completion ratio
 * @throws 500 on database error
 */
module.exports.getUserAchievements = (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);

  // Fetch user's earned achievements
  model.getUserAchievements({ user_id }, (err, earnedAchievements) => {
    if (err) return res.status(500).json({ message: "Internal server error." });

    // Fetch all achievements for comparison
    model.getAllAchievements((err, allAchievements) => {
      if (err)
        return res.status(500).json({ message: "Internal server error." });

      const earnedIds = earnedAchievements.map((a) => a.achievement_id);

      // Merge earned status with full achievement list
      const achievements = allAchievements.map((achievement) => ({
        ...achievement,
        is_earned: earnedIds.includes(achievement.achievement_id),
        earned_at: earnedAchievements.find(
          (a) => a.achievement_id === achievement.achievement_id
        )?.earned_at,
      }));

      res.status(200).json({
        achievements,
        earned_count: earnedAchievements.length,
        total_count: allAchievements.length,
        completion: `${earnedAchievements.length}/${allAchievements.length}`,
      });
    });
  });
};