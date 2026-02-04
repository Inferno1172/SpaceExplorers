// ========================================
// Database Initialisation Script
// ========================================

// Import the database connection pool
const pool = require("../services/db");

// ========================================
// SQL STATEMENTS
// ========================================
const SQLSTATEMENT = `
-- ========================================
-- CLEANUP: DROP TABLES (CHILD TABLES FIRST)
-- ========================================
DROP TABLE IF EXISTS UserAchievement;
DROP TABLE IF EXISTS SpaceAchievement;
DROP TABLE IF EXISTS UserUpgrade;
DROP TABLE IF EXISTS SpacecraftUpgrade;
DROP TABLE IF EXISTS UserPlanet;
DROP TABLE IF EXISTS Planet;
DROP TABLE IF EXISTS UserCompletion;
DROP TABLE IF EXISTS WellnessChallenge;
DROP TABLE IF EXISTS Users;

-- ========================================
-- USERS
-- ========================================
CREATE TABLE Users (
  user_id              INT AUTO_INCREMENT PRIMARY KEY,
  username             VARCHAR(255) NOT NULL UNIQUE,
  password             VARCHAR(255) NOT NULL,
  email                VARCHAR(255),
  points               INT DEFAULT 0,
  reset_token          VARCHAR(255),
  reset_token_expiry   DATETIME
);

-- ========================================
-- WELLNESS CHALLENGES
-- ========================================
CREATE TABLE WellnessChallenge (
  challenge_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id   INT NOT NULL,
  description  TEXT NOT NULL,
  points       INT NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES Users(user_id)
);

CREATE TABLE UserCompletion (
  completion_id INT AUTO_INCREMENT PRIMARY KEY,
  challenge_id  INT NOT NULL,
  user_id       INT NOT NULL,
  details       TEXT,
  FOREIGN KEY (challenge_id) REFERENCES WellnessChallenge(challenge_id),
  FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ========================================
-- SPACE EXPLORATION
-- ========================================
CREATE TABLE Planet (
  planet_id        INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  description      TEXT,
  fuel_required    INT NOT NULL,
  image_url        VARCHAR(255),
  discovery_reward INT DEFAULT 0,
  rarity           VARCHAR(20) DEFAULT 'common',
  order_index      INT NOT NULL
);

CREATE TABLE UserPlanet (
  user_planet_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id        INT NOT NULL,
  planet_id      INT NOT NULL,
  discovered_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  visits         INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (planet_id) REFERENCES Planet(planet_id),
  UNIQUE KEY unique_user_planet (user_id, planet_id)
);

-- ========================================
-- SPACECRAFT UPGRADES
-- ========================================
CREATE TABLE SpacecraftUpgrade (
  upgrade_id         INT AUTO_INCREMENT PRIMARY KEY,
  name               VARCHAR(255) NOT NULL,
  description        TEXT,
  category           VARCHAR(50) NOT NULL,
  price              INT NOT NULL,
  image_url          VARCHAR(255),
  rarity             VARCHAR(20) DEFAULT 'common',
  points_multiplier  DECIMAL(3,2) DEFAULT 1.00,
  unlock_requirement INT DEFAULT 0
);

CREATE TABLE UserUpgrade (
  user_upgrade_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  upgrade_id      INT NOT NULL,
  purchased_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_equipped     BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (upgrade_id) REFERENCES SpacecraftUpgrade(upgrade_id),
  UNIQUE KEY unique_user_upgrade (user_id, upgrade_id)
);

-- ========================================
-- ACHIEVEMENTS
-- ========================================
CREATE TABLE SpaceAchievement (
  achievement_id    INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(255) NOT NULL,
  description       TEXT,
  icon              VARCHAR(100),
  requirement_type  VARCHAR(50),
  requirement_value INT,
  reward_points     INT DEFAULT 0
);

CREATE TABLE UserAchievement (
  user_achievement_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL,
  achievement_id      INT NOT NULL,
  earned_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id),
  FOREIGN KEY (achievement_id) REFERENCES SpaceAchievement(achievement_id),
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- ========================================
-- SAMPLE USERS
-- ========================================
INSERT INTO Users (username, password, email, points) VALUES
('nshgoat',  '$2b$10$Iw4ySMROHcGf9oYISPs37eNrRyFQV3BxJxE9rubfY2x4tGkBd.Tmy', 'user1@example.com', 0),
('reubaby',  '$2b$10$Iw4ySMROHcGf9oYISPs37eNrRyFQV3BxJxE9rubfY2x4tGkBd.Tmy', 'user2@example.com', 10),
('6767',     '$2b$10$Iw4ySMROHcGf9oYISPs37eNrRyFQV3BxJxE9rubfY2x4tGkBd.Tmy', 'user3@example.com', 10);

-- ========================================
-- WELLNESS CHALLENGE DATA
-- ========================================
INSERT INTO WellnessChallenge (creator_id, description, points) VALUES
(1, 'Sleep like a boss – Get 7+ hours of sleep', 10),
(1, 'Stairs over elevator? Respect. – Take the stairs today', 20),
(2, 'Digital detox – No phone for 1 hour', 10),
(2, 'Take a 15-minute walk outside', 10),
(2, 'Talk to a friend face-to-face', 20),
(3, 'Clean your desk or room', 20),
(3, 'Help someone without being asked', 20);

INSERT INTO UserCompletion (challenge_id, user_id, details) VALUES
(1, 2, 'Proper rest achieved'),
(1, 3, 'Slept well');

-- ========================================
-- PLANET DATA
-- ========================================
INSERT INTO Planet
(name, description, fuel_required, discovery_reward, rarity, order_index)
VALUES
('Yavin IV',   'Rebel base hidden among jungle ruins', 0,    0,   'common',    1),
('Tatooine',   'A harsh desert world',                50,   20,  'common',    2),
('Hoth',       'Frozen battlefield',                  100,  20,  'common',    3),
('Naboo',      'Peaceful planet',                     200,  50,  'rare',      4),
('Dagobah',    'Mysterious swamp world',              350,  50,  'rare',      5),
('Mustafar',   'Volcanic planet',                     500,  100, 'epic',      6),
('Kamino',     'Ocean planet',                        750,  100, 'epic',      7),
('Coruscant',  'Galactic capital',                    1000, 350, 'legendary', 8),
('Exegol',     'Hidden Sith world',                   1500, 350, 'legendary', 9),
('Death Star', 'Ultimate weapon',                     2500, 500, 'mythic',   10);

-- ========================================
-- SPACECRAFT UPGRADE DATA
-- ========================================
INSERT INTO SpacecraftUpgrade
(name, description, category, price, image_url, rarity, points_multiplier, unlock_requirement)
VALUES
('Ion Engine',        'Improves fuel efficiency for short-range travel', 'engine',   50,  'ion_engine.png',        'common',    1.10, 1),
('Warp Drive',        'Allows faster interplanetary travel',             'engine',   200, 'warp_drive.png',        'rare',      1.30, 3),
('Hyperdrive Core',   'Top-tier engine used by elite explorers',          'engine',   500, 'hyperdrive.png',        'epic',      1.60, 6),

('Reinforced Hull',   'Strengthened hull plating',                        'hull',     100, 'reinforced_hull.png',   'common',    1.05, 2),
('Titanium Hull',     'Advanced hull material',                           'hull',     300, 'titanium_hull.png',     'rare',      1.20, 4),
('Neutronium Armor',  'Near-indestructible hull technology',              'hull',     800, 'neutronium_armor.png',  'legendary', 1.50, 7),

('Golden Paint',      'Luxury cosmetic finish',                           'cosmetic', 25,  'gold_paint.png',        'common',    1.00, 0),
('Nebula Glow',       'Cosmic visual trail effect',                       'cosmetic', 75,  'nebula_glow.png',        'rare',      1.00, 1),

('Auto-Navigation AI','Optimises travel routes automatically',            'special',  400, 'auto_nav_ai.png',       'epic',      1.40, 5),
('Quantum Scanner',   'Reveals hidden planetary bonuses',                 'special',  650, 'quantum_scanner.png',   'legendary', 1.55, 8);

-- ========================================
-- ACHIEVEMENT DATA
-- ========================================
INSERT INTO SpaceAchievement
(name, description, icon, requirement_type, requirement_value, reward_points)
VALUES
('First Launch',        'Begin your journey',            '🚀', 'planets',    1,   10),
('Explorer',            'Discover 3 planets',            '🌍', 'planets',    3,   50),
('Star Voyager',        'Discover 5 planets',            '⭐', 'planets',    5,   100),
('Cosmic Pioneer',      'Discover all planets',          '🌌', 'planets',    10,  500),
('Fuel Collector',      'Earn 100 points',               '⛽', 'points',     100, 25),
('Point Master',        'Earn 500 points',               '💯', 'points',     500, 100),
('Legendary Explorer',  'Earn 1000 points',              '👑', 'points',     1000,250),
('Challenge Champion',  'Complete 10 challenges',        '🏆', 'challenges', 10,  75),
('Wellness Warrior',    'Complete 25 challenges',        '⚔️', 'challenges', 25,  150),
('Ship Collector',      'Own 5 upgrades',                '🛸', 'upgrades',   5,   100),
('Fleet Admiral',       'Own 10 upgrades',               '⭐', 'upgrades',   10,  200);
`;

// ========================================
// EXECUTE INITIALISATION
// ========================================
pool.query(SQLSTATEMENT, (error) => {
  if (error) {
    console.error("❌ Database setup failed:", error);
  } else {
    console.log("✅ Database fully initialized and ready to go!");
  }
  process.exit();
});