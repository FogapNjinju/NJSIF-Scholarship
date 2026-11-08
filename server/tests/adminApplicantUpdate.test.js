const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const express = require("express");

const restoreEnv = (values) => {
  for (const [name, value] of Object.entries(values)) {
    if (typeof value === "undefined") delete process.env[name];
    else process.env[name] = value;
  }
};

test("admin can update applicant details and replace one document without losing others", async () => {
  const originalEnv = {
    PERSISTENT_DIR: process.env.PERSISTENT_DIR,
    MONGODB_URI: process.env.MONGODB_URI,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  };
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "njsif-admin-update-"));
  process.env.PERSISTENT_DIR = dataDir;
  delete process.env.MONGODB_URI;
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = "integration-test-password";
  process.env.ADMIN_SESSION_SECRET = "integration-test-session-secret-long-enough";
  process.env.NODE_ENV = "test";
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;

  const modulePaths = [
    "../models/storagePaths",
    "../models/database",
    "../models/csvStore",
    "../models/CsvApplication",
    "../models/Application",
    "../middleware/adminAuth",
    "../utils/cloudinaryDocuments",
    "../routes/applicationRoutes",
  ].map((modulePath) => require.resolve(modulePath));
  modulePaths.forEach((modulePath) => delete require.cache[modulePath]);

  let server;
  try {
    const Application = require("../models/Application");
    const { createSessionToken, SESSION_COOKIE } = require("../middleware/adminAuth");
    const { uploadsDir } = require("../models/storagePaths");
    const applicationRoutes = require("../routes/applicationRoutes");
    const app = express();
    app.use(express.json());
    app.use("/api/applications", applicationRoutes);
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));

    const application = new Application({
      name: "Applicant Before Edit",
      email: "applicant@example.com",
      education: "High School",
      program: "Undergraduate",
      goals: "Original goals",
      documents: { transcript: "old-transcript.pdf", idCard: "keep-id-card.pdf" },
    });
    await application.save();

    const formData = new FormData();
    formData.append("name", "Applicant After Edit");
    formData.append("email", "applicant@example.com");
    formData.append("education", "College / University");
    formData.append("program", "Postgraduate");
    formData.append("goals", "Updated goals");
    formData.append("transcript", new Blob(["replacement transcript"], { type: "application/pdf" }), "updated-transcript.pdf");

    const token = createSessionToken("admin@example.com", process.env.ADMIN_SESSION_SECRET);
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/applications/${application._id}/details`, {
      method: "PUT",
      headers: { cookie: `${SESSION_COOKIE}=${encodeURIComponent(token)}` },
      body: formData,
    });

    assert.equal(response.status, 200);
    const updated = await response.json();
    assert.equal(updated.name, "Applicant After Edit");
    assert.equal(updated.email, "applicant@example.com");
    assert.equal(updated.education, "College / University");
    assert.equal(updated.program, "Postgraduate");
    assert.equal(updated.goals, "Updated goals");
    assert.notEqual(updated.documents.transcript, "old-transcript.pdf");
    assert.equal(updated.documents.idCard, "keep-id-card.pdf");
    assert.equal(await fs.readFile(path.join(uploadsDir, updated.documents.transcript), "utf8"), "replacement transcript");
  } finally {
    if (server) {
      server.closeAllConnections?.();
      await new Promise((resolve) => server.close(resolve));
    }
    await fs.rm(dataDir, { recursive: true, force: true });
    restoreEnv(originalEnv);
    modulePaths.forEach((modulePath) => delete require.cache[modulePath]);
  }
});
