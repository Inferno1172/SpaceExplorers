// Import database connection pool
const pool = require("../services/db");
const spaceModel = require("../models/spaceModel");
const { calculatePointsMultiplier, awardPoints } = require("../utils/gameMechanics");

// ==================================================
// INSERT COMPLETION FOR A CHALLENGE
// ==================================================
module.exports.insertSingle = (data, callback) => {
  // Step 1: Retrieve the points value of the challenge
  const GET_POINTS = `
    SELECT points FROM WellnessChallenge
    WHERE challenge_id = ?;
  `;

  pool.query(GET_POINTS, [data.challenge_id], (err, results) => {
    if (err) {
      return callback(err); // Pass DB errors to controller
    }

    // Challenge not found — let controller handle it
    if (results.length === 0) {
      return callback(null, { challengeNotFound: true });
    }

    const challengePoints = results[0].points;

    // Step 2: Insert the user's completion record
    const INSERT_COMPLETION = `
      INSERT INTO UserCompletion (challenge_id, user_id, details)
      VALUES (?, ?, ?);
    `;

    pool.query(
      INSERT_COMPLETION,
      [data.challenge_id, data.user_id, data.details],
      (err, insertResults) => {
        if (err) {
          return callback(err); // Pass insertion errors
        }

        // Step 3: Fetch multiplier and award points
        spaceModel.getUserUpgrades({ user_id: data.user_id }, (err, upgrades) => {
          if (err) return callback(err);
          
          const multiplier = calculatePointsMultiplier(upgrades);
          const finalPoints = awardPoints(challengePoints, multiplier);

          const UPDATE_POINTS = `
            UPDATE Users
            SET points = points + ?
            WHERE user_id = ?;
          `;

          pool.query(UPDATE_POINTS, [finalPoints, data.user_id], (err) => {
            if (err) {
              return callback(err); // Pass point update errors
            }

            // Completion inserted and points awarded successfully
            callback(null, insertResults);
          });
        });
      }
    );
  });
};

// ==================================================
// GET ALL COMPLETIONS FOR A SPECIFIC CHALLENGE
// ==================================================
module.exports.getCompletionsByChallenge = (data, callback) => {
  // SQL statement to fetch all completions for a challenge
  const SQLSTATEMENT = `
    SELECT user_id, details
    FROM UserCompletion
    WHERE challenge_id = ?;
  `;

  pool.query(SQLSTATEMENT, [data.challenge_id], callback);
};

// ==================================================
// GET ALL COMPLETIONS FOR A SPECIFIC USER AND CHALLENGE
// ==================================================
module.exports.getCompletionsByUser = (data, callback) => {
  // SQL statement to fetch all completions for a challenge by a specific user
  const SQLSTATEMENT = `
    SELECT completion_id, details
    FROM UserCompletion
    WHERE challenge_id = ? AND user_id = ?
    ORDER BY completion_id DESC;
  `;

  pool.query(SQLSTATEMENT, [data.challenge_id, data.user_id], callback);
};