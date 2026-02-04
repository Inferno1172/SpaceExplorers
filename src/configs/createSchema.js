const pool = require("../services/db");

// Get database name from pool config
const database = pool.config.connectionConfig.database;

// Set database to null to create the database
pool.config.connectionConfig.database = null;

// SQL statements
const CHECK_DB_SQL = `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '${database}'`;
const CREATE_DB_SQL = `CREATE DATABASE IF NOT EXISTS ${database}`;

// Check if database exists
pool.query(CHECK_DB_SQL, (error, results) => {
  if (error) {
    console.error("Error checking database:", error);
    process.exit(1);
  }

  if (results.length === 0) {
    // Database does not exist, create it
    console.log(`Database "${database}" does not exist`);

    pool.query(CREATE_DB_SQL, (error, results) => {
      if (error) {
        console.error("Error creating database:", error);
        process.exit(1);
      }

      console.log(`Database "${database}" has been created successfully`);
      process.exit(0);
    });
  } else {
    // Database already exists
    console.log(`Database "${database}" already exists`);
    process.exit(0);
  }
});