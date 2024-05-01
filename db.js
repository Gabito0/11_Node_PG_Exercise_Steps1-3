/** Database setup for BizTime. */
const { Client } = require("pg");
require("dotenv").config();

let DB_URI;

// If we're running in test "mode", use our test db
if (process.env.NODE_ENV === "test") {
  DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME_TEST}`;
} else {
  DB_URI = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
}

let db = new Client({
  connectionString: DB_URI,
});

db.connect((err) => {
  if (err) {
    console.log("Failed to connect to the database:", err.stack);
  } else {
    console.log("Succesfully connected to the database");
  }
});

module.exports = db;
