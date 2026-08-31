const router = require("express").Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const Application = require("../models/Application");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    cb(null, `${suffix}-${safeName}`);
  },
});

const upload = multer({ storage });

const ALLOWED_STATUSES = ["pending", "accepted", "rejected", "archived", "deleted"];

const normalizeStatus = (value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "archive" ? "archived" : normalized;
};

const normalizeScore = (value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return undefined;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }

  return parsed;
};

const buildUpdatePayload = (existing, payload = {}) => {
  const { status, reviewed, reviewNote, decisionReason } = payload;
  const normalizedStatus = normalizeStatus(status);
  const score = normalizeScore(payload.score);

  if (normalizedStatus && !ALLOWED_STATUSES.includes(normalizedStatus)) {
    const error = new Error("Invalid status value");
    error.statusCode = 400;
    throw error;
  }

  if (typeof payload.score !== "undefined" && score === null) {
    const error = new Error("Invalid score value. Use a number between 0 and 100.");
    error.statusCode = 400;
    throw error;
  }

  const effectiveStatus = normalizedStatus || existing.status || "pending";
  const historyEntries = [];

  if (normalizedStatus && normalizedStatus !== existing.status) {
    historyEntries.push({
      action: `Status changed to ${normalizedStatus}`,
      note: decisionReason || reviewNote || "Decision updated by admin",
      status: normalizedStatus,
      at: new Date(),
    });
  }

  if (typeof reviewed === "boolean" && reviewed !== existing.reviewed) {
    historyEntries.push({
      action: reviewed ? "Marked as reviewed" : "Marked as not reviewed",
      note: reviewNote || "Review state updated by admin",
      status: effectiveStatus,
      at: new Date(),
    });
  }

  if (typeof reviewNote === "string" && reviewNote !== existing.reviewNote) {
    historyEntries.push({
      action: "Internal review note updated",
      note: reviewNote || "Review note cleared",
      status: effectiveStatus,
      at: new Date(),
    });
  }

  if (typeof decisionReason === "string" && decisionReason !== existing.decisionReason) {
    historyEntries.push({
      action: "Decision reason updated",
      note: decisionReason || "Decision reason cleared",
      status: effectiveStatus,
      at: new Date(),
    });
  }

  if (typeof score !== "undefined" && score !== Number(existing.score || 0)) {
    historyEntries.push({
      action: "Applicant score updated",
      note: `Score set to ${score}/100`,
      status: effectiveStatus,
      at: new Date(),
    });
  }

  const fieldsToSet = {
    ...(normalizedStatus ? { status: normalizedStatus } : {}),
    ...(typeof score !== "undefined" ? { score } : {}),
    ...(typeof reviewed === "boolean" ? { reviewed } : {}),
    ...(typeof reviewNote === "string" ? { reviewNote } : {}),
    ...(typeof decisionReason === "string" ? { decisionReason } : {}),
    lastReviewedAt: new Date(),
  };

  if (normalizedStatus === "archived" && existing.status !== "archived") {
    fieldsToSet.archivedAt = new Date();
  } else if (normalizedStatus && normalizedStatus !== "archived" && existing.status === "archived") {
    fieldsToSet.archivedAt = null;
  }

  return {
    $set: fieldsToSet,
    ...(historyEntries.length > 0 ? { $push: { history: { $each: historyEntries } } } : {}),
  };
};

const uploadFields = upload.fields([
  { name: "gceOLevel", maxCount: 1 },
  { name: "gceALevel", maxCount: 1 },
  { name: "transcript", maxCount: 1 },
  { name: "attestation", maxCount: 1 },
  { name: "idCard", maxCount: 1 },
]);

router.post("/", uploadFields, async (req, res) => {
  try {
    const { name, email, education, program, goals } = req.body;
    const files = req.files || {};

    const documents = {
      gceOLevel: files.gceOLevel?.[0]?.filename || "",
      gceALevel: files.gceALevel?.[0]?.filename || "",
      transcript: files.transcript?.[0]?.filename || "",
      attestation: files.attestation?.[0]?.filename || "",
      idCard: files.idCard?.[0]?.filename || "",
    };

    const app = new Application({
      name,
      email,
      education,
      program,
      goals,
      documents,
      history: [
        {
          action: "Application submitted",
          note: "Initial scholarship application created",
          status: "pending",
          at: new Date(),
        },
      ],
    });
    await app.save();
    res.json(app);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load applications" });
  }
});

router.get("/documents/:filename/view", async (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, "../uploads", safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to open document" });
  }
});

router.get("/documents/:filename/download", async (req, res) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(__dirname, "../uploads", safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "Document not found" });
    }

    return res.download(filePath, safeFilename);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to download document" });
  }
});

router.put("/bulk-update", async (req, res) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids.filter(Boolean) : [];

    if (ids.length === 0) {
      return res.status(400).json({ error: "Select at least one application." });
    }

    const existingApplications = await Application.find({ _id: { $in: ids } });

    if (existingApplications.length === 0) {
      return res.status(404).json({ error: "No matching applications found." });
    }

    await Promise.all(
      existingApplications.map((application) => {
        const updatePayload = buildUpdatePayload(application, req.body);
        return Application.findByIdAndUpdate(application._id, updatePayload, { new: true });
      })
    );

    const updatedApplications = await Application.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    res.json({ updatedCount: updatedApplications.length, applications: updatedApplications });
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Unable to update applications." });
  }
});

const archiveApplication = async (req, res) => {
  try {
    const existing = await Application.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updatePayload = buildUpdatePayload(existing, {
      ...req.body,
      status: "archived",
      reviewed: typeof req.body?.reviewed === "boolean" ? req.body.reviewed : true,
      reviewNote: req.body?.reviewNote ?? existing.reviewNote,
      decisionReason: req.body?.decisionReason ?? existing.decisionReason,
    });

    const updated = await Application.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Unable to archive application" });
  }
};

const restoreApplication = async (req, res) => {
  try {
    const existing = await Application.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updatePayload = buildUpdatePayload(existing, {
      ...req.body,
      status: req.body?.status || "pending",
    });

    const updated = await Application.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Unable to restore application" });
  }
};

router.patch("/:id/archive", archiveApplication);
router.post("/:id/archive", archiveApplication);
router.patch("/:id/restore", restoreApplication);
router.post("/:id/restore", restoreApplication);

router.put("/:id", async (req, res) => {
  try {
    const existing = await Application.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const updatePayload = buildUpdatePayload(existing, req.body);
    const updated = await Application.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(error.statusCode || 500).json({ error: error.message || "Unable to update application" });
  }
});

const removeApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    Object.values(application.documents || {}).forEach((filename) => {
      if (!filename) return;

      const filePath = path.join(__dirname, "../uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to delete application" });
  }
};

router.delete("/:id", removeApplication);
router.post("/:id/delete", removeApplication);

module.exports = router;