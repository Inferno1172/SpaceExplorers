require("dotenv").config(); // Load environment variables from .env

const mysql = require("mysql2");

// ==================================================
// DATABASE CONNECTION SETTINGS
// ==================================================
const setting = {
  connectionLimit: 10,           // Maximum number of simultaneous connections
  host: process.env.DB_HOST,     // Database host from environment
  user: process.env.DB_USER,     // Database user from environment
  password: process.env.DB_PASSWORD, // Database password from environment
  database: process.env.DB_DATABASE, // Database name from environment
  multipleStatements: true,      // Allow executing multiple SQL statements in one query
  dateStrings: true,             // Return DATE and DATETIME fields as strings instead of JS Date objects
};

// ==================================================
// CREATE CONNECTION POOL
// ==================================================
const pool = mysql.createPool(setting);

// ==================================================
// EXPORT POOL FOR USE IN MODELS
// ==================================================
module.exports = pool;