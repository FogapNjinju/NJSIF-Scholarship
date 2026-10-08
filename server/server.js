require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("node:fs");
const { uploadsDir } = require("./models/storagePaths");
const { connectDatabase } = require("./models/database");

const app = express();
fs.mkdirSync(uploadsDir, { recursive: true });

const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

const allowedOrigins = [...new Set([
  ...defaultOrigins,
  ...(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
])];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
}));
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/health", async (req, res) => {
  try {
    const database = await connectDatabase();
    res.json({ status: "ok", database: database.mode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", error: error.message });
  }
});

app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const port = Number(process.env.PORT) || 5000;
connectDatabase()
  .then(({ mode }) => {
    console.log(`Server running on port ${port} using ${mode}`);
    app.listen(port);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });