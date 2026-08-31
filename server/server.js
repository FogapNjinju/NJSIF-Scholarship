const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

app.listen(5000, () => console.log("Server running"));