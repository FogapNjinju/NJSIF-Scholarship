const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin is not allowed by CORS"));
  },
}));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error("Missing MONGO_URI in environment. Add it to .env or your environment variables.");
  process.exit(1);
}
if (mongoUri.includes("<db_password>")) {
  console.error("MONGO_URI contains the placeholder <db_password>. Replace it with your actual Atlas user password.");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => console.log("DB connected"))
  .catch(err => console.error(err));

app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/testimonials", require("./routes/testimonialRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

const port = Number(process.env.PORT) || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));