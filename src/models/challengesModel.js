// Import database connection pool
const pool = require("../services/db");

// ==================================================
// INSERT NEW CHALLENGE
// ==================================================
module.exports.insertSingle = (data, callback) => {
  // SQL statement to insert a new wellness challenge
  const SQLSTATEMENT = `
    INSERT INTO WellnessChallenge (creator_id, description, points)
    VALUES (?, ?, ?);
  `;

  // Values mapped safely to SQL placeholders
  const VALUES = [data.user_id, data.description, data.points];

  // Execute query
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// READ ALL CHALLENGES
// ==================================================
module.exports.readAllChallenges = (callback) => {
  // SQL statement to retrieve all challenges with total completion count
  const SQLSTATEMENT = `
    SELECT 
      wc.*, 
      COUNT(uc.completion_id) AS total_completions
    FROM WellnessChallenge wc
    LEFT JOIN UserCompletion uc ON wc.challenge_id = uc.challenge_id
    GROUP BY wc.challenge_id;
  `;

  // Execute query
  pool.query(SQLSTATEMENT, callback);
};

// ==================================================
// UPDATE CHALLENGE BY ID (CREATOR ONLY)
// ==================================================
module.exports.updateChallengeById = (data, callback) => {
  // SQL statement ensures only the creator can update the challenge
  const SQLSTATEMENT = `
    UPDATE WellnessChallenge
    SET description = ?, points = ?
    WHERE challenge_id = ? AND creator_id = ?;
  `;

  // Values mapped to placeholders
  const VALUES = [
    data.description,
    data.points,
    data.challenge_id,
    data.user_id,
  ];

  // Execute query
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// DELETE CHALLENGE BY ID (WITH CASCADE HANDLING)
// ==================================================
module.exports.deleteChallengeById = (data, callback) => {
  // SQL statement to delete all completions linked to the challenge
  const DELETE_COMPLETIONS = `
    DELETE FROM UserCompletion
    WHERE challenge_id = ?;
  `;

  // Delete dependent records first to maintain referential integrity
  pool.query(DELETE_COMPLETIONS, [data.challenge_id], (err) => {
    if (err) {
      return callback(err);
    }

    // SQL statement to delete the challenge itself
    const DELETE_CHALLENGE = `
      DELETE FROM WellnessChallenge
      WHERE challenge_id = ?;
    `;

    // Execute deletion of challenge
    pool.query(DELETE_CHALLENGE, [data.challenge_id], callback);
  });
};

// ==================================================
// GET CHALLENGE BY ID
// ==================================================
module.exports.getChallengeById = (challenge_id, callback) => {
  // SQL statement to retrieve a specific challenge
  const SQLSTATEMENT = `
    SELECT challenge_id, creator_id, description, points
    FROM WellnessChallenge
    WHERE challenge_id = ?;
  `;

  // Execute query
  pool.query(SQLSTATEMENT, [challenge_id], callback);
};