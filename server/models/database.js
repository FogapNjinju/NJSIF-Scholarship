const mongoose = require("mongoose");

const mongoUri = process.env.MONGODB_URI?.trim();
const isMongoConfigured = Boolean(mongoUri);

const connectDatabase = async () => {
  if (!isMongoConfigured) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("MONGODB_URI is required in production. Configure the MongoDB Atlas connection string.");
    }

    return { connected: false, mode: "csv" };
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  return { connected: true, mode: "mongodb" };
};

module.exports = { connectDatabase, isMongoConfigured, mongoUri };
