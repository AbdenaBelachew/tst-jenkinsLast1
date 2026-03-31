const { Pool } = require("pg");
require("dotenv").config();

const db = new Pool({
  user: process.env.DB_USER || "postgres",
  // host: process.env.DB_HOST || "10.8.101.3",
  host: process.env.DB_HOST || "10.8.100.80",
  // host: process.env.DB_HOST || "localhost",
  database: process.env.DB_DATABASE || "coop_erp_latest",
  password: process.env.DB_PASSWORD || "123456",
  port: process.env.DB_PORT || 5432,
  // Connection pool settings for better reliability
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
});

// Handle pool errors to prevent application crashes
db.on('error', (err, client) => {
  console.error('Unexpected error on idle database client:', err);
});

// Test the connection
db.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("❌ Database connection failed:", err.message);
    console.error("   Host:", process.env.DB_HOST || "localhost");
    console.error("   Database:", process.env.DB_DATABASE || "coop_erp_latest");
    console.error("   User:", process.env.DB_USER || "postgres");
    console.error("   Port:", process.env.DB_PORT || 5432);
  } else {
    console.log("✅ Database connected successfully");
    console.log("   Host:", process.env.DB_HOST || "localhost");
    console.log("   Database:", process.env.DB_DATABASE || "coop_erp_latest");
  }
});

module.exports = db;
