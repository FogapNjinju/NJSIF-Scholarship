const path = require("node:path");

const storageRoot = process.env.PERSISTENT_DIR || path.resolve(__dirname, "..");

module.exports = {
  dataDir: path.join(storageRoot, "data"),
  uploadsDir: path.join(storageRoot, "uploads"),
};