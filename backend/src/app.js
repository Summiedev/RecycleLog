const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cron = require("node-cron");
const connectDB = require("./utils/db");
const api = require("../src/routes");
const { saveAIInsights } = require("./utils/ai");
const {
  addWasteToBin,
  updateBinFillPercent,
  emptyBin,
} = require("./utils/iot");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

// Connect to DB
connectDB();

// Schedule AI insights generation to run every 40 minutes
cron.schedule(
  "*/40 * * * *",
  async () => {
    console.log("🤖 Every 40 minutes: Starting AI insights generation...");
    try {
      await saveAIInsights();
      console.log("✅ AI insights completed successfully");
    } catch (error) {
      console.error("❌ AI insights failed:", error.message);
    }
  },
  {
    timezone: "Africa/Lagos", // Nigerian timezone
  },
);

// Schedule adding waste to bins every 30 seconds
cron.schedule("*/9 * * * * *", async () => {
  try {
    const randomTimes = Math.floor(Math.random() * 10) + 1;
    for (let i = 0; i < randomTimes; i++) {
      await addWasteToBin();
    }
  } catch (error) {
    console.error("❌ Error adding waste:", error.message);
  }
});

// Schedule updating bin fill percent every 30 seconds
cron.schedule("*/27 * * * * *", async () => {
  try {
    const randomTimes = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < randomTimes; i++) {
      await updateBinFillPercent();
    }
  } catch (error) {
    console.error("❌ Error updating fill percent:", error.message);
  }
});

// Schedule emptying bins every 3 minutes
cron.schedule("*/3 * * * *", async () => {
  try {
    const randomTimes = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < randomTimes; i++) {
      await emptyBin();
    }
  } catch (error) {
    console.error("❌ Error emptying bin:", error.message);
  }
});

console.log("⏰ AI insights scheduler initialized - will run every 40 minutes");
console.log("🔄 IoT simulation schedulers initialized:");
console.log("   - Adding waste every 30 seconds");
console.log("   - Updating fill percent every 30 seconds");
console.log("   - Emptying bins every 3 minutes");

app.use("/api", api);

// Root
app.get("/", (req, res) => {
  res.send("RecycLog AI Backend Running");
});

module.exports = app;
