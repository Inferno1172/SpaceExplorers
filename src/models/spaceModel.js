const pool = require("../services/db");

// ==================================================
// GET ALL PLANETS
// ==================================================
module.exports.getAllPlanets = (callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Planet ORDER BY order_index ASC;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// ==================================================
// GET PLANET BY ID
// ==================================================
module.exports.getPlanetById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Planet WHERE planet_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.planet_id], callback);
};

// ==================================================
// GET PLANETS DISCOVERED BY USER
// ==================================================
module.exports.getUserPlanets = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT up.*, p.name, p.description, p.image_url, p.rarity, p.fuel_required
    FROM UserPlanet up
    JOIN Planet p ON up.planet_id = p.planet_id
    WHERE up.user_id = ?
    ORDER BY p.order_index ASC;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// ==================================================
// CHECK IF PLANET ALREADY DISCOVERED BY USER
// ==================================================
module.exports.checkPlanetDiscovery = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM UserPlanet
    WHERE user_id = ? AND planet_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.planet_id], callback);
};

// ==================================================
// RECORD PLANET DISCOVERY FOR USER
// ==================================================
module.exports.discoverPlanet = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserPlanet (user_id, planet_id)
    VALUES (?, ?);
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.planet_id], callback);
};

// ==================================================
// GET SPACECRAFT UPGRADES (OPTIONAL CATEGORY FILTER)
// ==================================================
module.exports.getSpacecraftUpgrades = (data, callback) => {
  let SQLSTATEMENT = `SELECT * FROM SpacecraftUpgrade`;
  let VALUES = [];

  if (data.category) {
    SQLSTATEMENT += ` WHERE category = ?`;
    VALUES.push(data.category);
  }

  SQLSTATEMENT += ` ORDER BY price ASC;`;
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// GET SINGLE UPGRADE BY ID
// ==================================================
module.exports.getUpgradeById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM SpacecraftUpgrade WHERE upgrade_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.upgrade_id], callback);
};

// ==================================================
// CHECK IF USER OWNS A SPECIFIC UPGRADE
// ==================================================
module.exports.checkUpgradeOwnership = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM UserUpgrade
    WHERE user_id = ? AND upgrade_id = ?;
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.upgrade_id], callback);
};

// ==================================================
// ADD UPGRADE TO USER
// ==================================================
module.exports.addUpgradeToUser = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserUpgrade (user_id, upgrade_id)
    VALUES (?, ?);
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.upgrade_id], callback);
};

// ==================================================
// GET ALL UPGRADES OWNED BY USER
// ==================================================
module.exports.getUserUpgrades = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT uu.*, su.name, su.description, su.category, su.price, 
           su.image_url, su.rarity, su.points_multiplier
    FROM UserUpgrade uu
    JOIN SpacecraftUpgrade su ON uu.upgrade_id = su.upgrade_id
    WHERE uu.user_id = ?
    ORDER BY uu.purchased_at DESC;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// ==================================================
// TOGGLE EQUIPPED STATUS OF UPGRADE
// ==================================================
module.exports.toggleUpgradeEquipped = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE UserUpgrade
    SET is_equipped = ?
    WHERE user_id = ? AND upgrade_id = ?;
  `;
  pool.query(
    SQLSTATEMENT,
    [data.is_equipped, data.user_id, data.upgrade_id],
    callback
  );
};

// ==================================================
// GET ALL ACHIEVEMENTS
// ==================================================
module.exports.getAllAchievements = (callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM SpaceAchievement ORDER BY requirement_value ASC;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// ==================================================
// GET ALL ACHIEVEMENTS EARNED BY USER
// ==================================================
module.exports.getUserAchievements = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT ua.*, sa.name, sa.description, sa.icon, sa.reward_points
    FROM UserAchievement ua
    JOIN SpaceAchievement sa ON ua.achievement_id = sa.achievement_id
    WHERE ua.user_id = ?
    ORDER BY ua.earned_at DESC;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// ==================================================
// GET USER STATS FOR ACHIEVEMENTS CALCULATION
// ==================================================
module.exports.getUserStats = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT 
      u.user_id,
      u.points,
      COUNT(DISTINCT up.planet_id) as planets_discovered,
      COUNT(DISTINCT uc.completion_id) as challenges_completed,
      COUNT(DISTINCT uup.upgrade_id) as upgrades_owned
    FROM Users u
    LEFT JOIN UserPlanet up ON u.user_id = up.user_id
    LEFT JOIN UserCompletion uc ON u.user_id = uc.user_id
    LEFT JOIN UserUpgrade uup ON u.user_id = uup.user_id
    WHERE u.user_id = ?
    GROUP BY u.user_id;
  `;
  pool.query(SQLSTATEMENT, [data.user_id], callback);
};

// ==================================================
// GET UNLOCKED BUT UNEARNED ACHIEVEMENTS
// ==================================================
module.exports.getEligibleAchievements = (userStats, callback) => {
  const SQLSTATEMENT = `
    SELECT sa.* FROM SpaceAchievement sa
    LEFT JOIN UserAchievement ua ON sa.achievement_id = ua.achievement_id AND ua.user_id = ?
    WHERE ua.user_achievement_id IS NULL
    AND (
      (sa.requirement_type = 'planets' AND ? >= sa.requirement_value)
      OR (sa.requirement_type = 'points' AND ? >= sa.requirement_value)
      OR (sa.requirement_type = 'challenges' AND ? >= sa.requirement_value)
      OR (sa.requirement_type = 'upgrades' AND ? >= sa.requirement_value)
    );
  `;
  pool.query(
    SQLSTATEMENT,
    [
      userStats.user_id,
      userStats.planets_discovered,
      userStats.points,
      userStats.challenges_completed,
      userStats.upgrades_owned,
    ],
    callback
  );
};

// ==================================================
// AWARD ACHIEVEMENT TO USER
// ==================================================
module.exports.awardAchievement = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO UserAchievement (user_id, achievement_id)
    VALUES (?, ?);
  `;
  pool.query(SQLSTATEMENT, [data.user_id, data.achievement_id], callback);
};