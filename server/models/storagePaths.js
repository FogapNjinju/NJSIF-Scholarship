const path = require("node:path");

const resolveStorageRoot = () => {
  const configuredDir = process.env.PERSISTENT_DIR;

  if (typeof configuredDir === "string" && configuredDir.trim()) {
    return path.resolve(configuredDir.trim());
  }

  return path.resolve(__dirname, "..", "persistent-data");
};

const storageRoot = resolveStorageRoot();

module.exports = {
  storageRoot,
  dataDir: path.join(storageRoot, "data"),
  uploadsDir: path.join(storageRoot, "uploads"),
};