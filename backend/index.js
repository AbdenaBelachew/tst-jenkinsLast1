const express = require("express");
const cors = require("cors");
const db = require("./db");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Status Endpoint
app.get("/api/status", async (req, res) => {
  try {
    const dbRes = await db.query("SELECT NOW()");
    res.json({
      status: "Online",
      message: "Backend connected to PostgreSQL",
      time: dbRes.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: "Offline",
      message: "Database connection failed",
      error: err.message,
    });
  }
});

// Simple root endpoint
app.get("/", (req, res) => {
  res.send("Backend Server is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server ready at http://localhost:${PORT}`);
});
