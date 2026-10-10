const mongoose = require("mongoose");

const normalizeEnvKey = (key) => (typeof key === "string" ? key.trim() : key);

const readEnv = (name) => {
  const exactKey = process.env[name];
  if (typeof exactKey === "string" && exactKey.trim()) {
    return exactKey.trim();
  }

  const alternateKey = Object.keys(process.env).find((key) => normalizeEnvKey(key) === name);
  const alternateValue = alternateKey ? process.env[alternateKey] : undefined;

  return typeof alternateValue === "string" ? alternateValue.trim() : "";
};

const mongoUri = readEnv("MONGODB_URI");
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
