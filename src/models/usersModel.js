const pool = require("../services/db");

// ==================================================
// INSERT NEW USER
// ==================================================
module.exports.insertSingle = (data, callback) => {
  const SQLSTATEMENT = `
    INSERT INTO Users (username, password, email)
    VALUES (?, ?, ?);
  `;
  const VALUES = [data.username, data.password, data.email];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// GET ALL USERS
// ==================================================
module.exports.readAllUser = (callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, username, email, points FROM Users;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// ==================================================
// GET USER BY ID
// ==================================================
module.exports.readUserById = (data, callback) => {
  const SQLSTATEMENT = `
    SELECT user_id, username, email, points FROM Users
    WHERE user_id = ?;
  `;
  const VALUES = [data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// UPDATE USER BY ID
// ==================================================
module.exports.updateUserById = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE Users
    SET username = ?, points = ?
    WHERE user_id = ?;
  `;
  const VALUES = [data.username, data.points, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// GET USER BY USERNAME
// ==================================================
module.exports.readUserByUsername = (username, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Users
    WHERE username = ?;
  `;
  const VALUES = [username];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// GET LEADERBOARD (ORDERED BY POINTS DESC)
// ==================================================
module.exports.readLeaderboard = (callback) => {
  const SQLSTATEMENT = `
    SELECT username, points FROM Users
    ORDER BY points DESC;
  `;
  pool.query(SQLSTATEMENT, callback);
};

// ==================================================
// GET USER BY EMAIL
// ==================================================
module.exports.readUserByEmail = (email, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Users
    WHERE email = ?;
  `;
  const VALUES = [email];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// SAVE RESET TOKEN AND EXPIRY FOR PASSWORD RESET
// ==================================================
module.exports.saveResetToken = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE Users
    SET reset_token = ?, reset_token_expiry = ?
    WHERE email = ?;
  `;
  const VALUES = [data.token, data.expiry, data.email];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// GET USER BY RESET TOKEN (ONLY VALID TOKENS)
// ==================================================
module.exports.readUserByResetToken = (token, callback) => {
  const SQLSTATEMENT = `
    SELECT * FROM Users
    WHERE reset_token = ? AND reset_token_expiry > NOW();
  `;
  const VALUES = [token];
  pool.query(SQLSTATEMENT, VALUES, callback);
};

// ==================================================
// UPDATE PASSWORD AND CLEAR RESET TOKEN
// ==================================================
module.exports.updatePasswordAndClearResetToken = (data, callback) => {
  const SQLSTATEMENT = `
    UPDATE Users
    SET password = ?, reset_token = NULL, reset_token_expiry = NULL
    WHERE user_id = ?;
  `;
  const VALUES = [data.password, data.user_id];
  pool.query(SQLSTATEMENT, VALUES, callback);
};