const router = require("express").Router();
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const cloudinary = require("cloudinary").v2;
const Application = require("../models/Application");
const { uploadsDir } = require("../models/storagePaths");
const { requireAdminAuth } = require("../middleware/adminAuth");
const { createSignedDocumentUrl } = require("../utils/cloudinaryDocuments");
const MAX_DOCUMENT_BYTES = 4 * 1024 * 1024;
const DOCUMENT_FIELDS = new Set(["gceOLevel", "gceALevel", "transcript", "attestation", "idCard"]);

const isCloudinaryConfigured = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured for uploads.");
} else {
  console.warn("Cloudinary not configured; uploads will fall back to local filesystem storage.");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES },
});

const uploadBufferToStorage = async (file) => {
  if (!file || !file.buffer) {
    return "";
  }

  if (isCloudinaryConfigured()) {
    console.log(`Uploading document to Cloudinary: ${file.originalname}`);
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "njsif-applications",
          resource_type: "auto",
          type: "authenticated",
          access_mode: "authenticated",
          use_filename: true,
          unique_filename: true,
        },
        (error, response) => {
          if (error) {
            console.error("Cloudinary upload error:", error.message || error);
            reject(error);
            return;
          }

          console.log("Cloudinary upload successful for:", file.originalname);
          resolve(response);
        }
      );

      stream.end(file.buffer);
    });

    return result?.secure_url || result?.url || "";
  }

  const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, "-");
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeName}`;
  const fullPath = path.join(uploadsDir, uniqueName);

  await fs.promises.mkdir(uploadsDir, { recursive: true });
  await fs.promises.writeFile(fullPath, file.buffer);

  return uniqueName;
};

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
const updateApplicantUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DOCUMENT_BYTES },
  fileFilter(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const acceptedTypes = new Set([".pdf", ".jpg", ".jpeg", ".png"]);
    if (!acceptedTypes.has(extension)) {
      return callback(new Error("Documents must be PDF, JPG, JPEG, or PNG files."));
    }
    return callback(null, true);
  },
}).fields([
  { name: "gceOLevel", maxCount: 1 },
  { name: "gceALevel", maxCount: 1 },
  { name: "transcript", maxCount: 1 },
  { name: "attestation", maxCount: 1 },
  { name: "idCard", maxCount: 1 },
]);

router.post("/", (req, res, next) => {
  uploadFields(req, res, (error) => {
    if (!error) {
      return next();
    }

    const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(isFileTooLarge ? 413 : 400).json({
      error: isFileTooLarge
        ? "Each document must be 4 MB or smaller."
        : "Unable to process uploaded documents.",
    });
  });
}, async (req, res) => {
  try {
    const { name, email, education, program, goals } = req.body;
    const files = req.files || {};
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (normalizedEmail) {
      const applications = await Application.find();
      const alreadyApplied = applications.some((application) =>
        application.status !== "deleted" && String(application.email || "").trim().toLowerCase() === normalizedEmail
      );

      if (alreadyApplied) {
        return res.status(409).json({
          error: "An application has already been submitted with this email address. Contact support if you need help.",
        });
      }
    }

    const documentEntries = await Promise.all(
      Object.entries(files).map(async ([fieldName, fileList]) => {
        const file = fileList?.[0];
        const uploadedValue = await uploadBufferToStorage(file);
        return [fieldName, uploadedValue];
      })
    );

    const documents = Object.fromEntries(documentEntries);

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
    console.error("Application upload failed:", {
      message: error?.message,
      stack: error?.stack,
      fileFields: Object.keys(req.files || {}),
    });
    res.status(500).json({
      error: "Upload failed",
      ...(process.env.NODE_ENV !== "production" ? { details: error?.message } : {}),
    });
  }
});

router.use(requireAdminAuth);

router.put("/:id/details", (req, res, next) => {
  updateApplicantUpload(req, res, (error) => {
    if (!error) return next();

    const isFileTooLarge = error.code === "LIMIT_FILE_SIZE";
    return res.status(isFileTooLarge ? 413 : 400).json({
      error: isFileTooLarge
        ? "Each replacement document must be 4 MB or smaller."
        : error.message || "Unable to process replacement documents.",
    });
  });
}, async (req, res) => {
  try {
    const existing = await Application.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Application not found" });
    }

    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const education = String(req.body?.education || "").trim();
    const program = String(req.body?.program || "").trim();
    const goals = String(req.body?.goals || "").trim();
    if (!name || !email || !education || !program || !goals) {
      return res.status(400).json({ error: "Name, email, education, program, and goals are required." });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Enter a valid email address." });
    }

    const applications = await Application.find();
    const duplicateEmail = applications.some((application) =>
      String(application._id) !== String(existing._id) &&
      application.status !== "deleted" &&
      String(application.email || "").trim().toLowerCase() === email
    );
    if (duplicateEmail) {
      return res.status(409).json({ error: "Another application already uses this email address." });
    }

    const files = Object.values(req.files || {}).flat();
    const totalBytes = files.reduce((total, file) => total + file.size, 0);
    if (totalBytes > MAX_DOCUMENT_BYTES) {
      return res.status(413).json({ error: "Replacement documents together must be 4 MB or smaller." });
    }

    const documents = { ...(existing.documents || {}) };
    for (const [field, fileList] of Object.entries(req.files || {})) {
      const uploadedValue = await uploadBufferToStorage(fileList[0]);
      if (!uploadedValue) {
        return res.status(502).json({ error: `Unable to store the replacement ${field} document.` });
      }
      documents[field] = uploadedValue;
    }

    const updated = await Application.findByIdAndUpdate(req.params.id, {
      $set: { name, email, education, program, goals, documents },
      $push: {
        history: {
          action: "Applicant details updated",
          note: files.length ? "Applicant details and documents updated by admin" : "Applicant details updated by admin",
          status: existing.status || "pending",
          at: new Date(),
        },
      },
    }, { new: true, runValidators: true });

    return res.json(updated);
  } catch (error) {
    console.error("Applicant details update failed:", {
      message: error?.message,
      fileFields: Object.keys(req.files || {}),
    });
    return res.status(500).json({ error: "Unable to update applicant details." });
  }
});

const deliverDocument = async (req, res, attachment) => {
  const { id, field } = req.params;
  if (!DOCUMENT_FIELDS.has(field)) {
    return res.status(404).json({ error: "Document not found" });
  }

  const application = await Application.findById(id);
  const value = application?.documents?.[field];
  if (!application || !value) {
    return res.status(404).json({ error: "Document not found" });
  }

  if (/^https?:\/\//i.test(String(value))) {
    const signedUrl = createSignedDocumentUrl({
      value,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinary,
      attachment,
    });
    if (!signedUrl) {
      return res.status(404).json({ error: "Stored document URL is not supported" });
    }
    return res.redirect(302, signedUrl);
  }

  const safeFilename = path.basename(String(value));
  const filePath = path.join(uploadsDir, safeFilename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Document not found" });
  }

  return attachment ? res.download(filePath, safeFilename) : res.sendFile(filePath);
};

router.get("/:id/documents/:field/view", async (req, res) => {
  try {
    return await deliverDocument(req, res, false);
  } catch (error) {
    console.error("Document view failed:", error);
    return res.status(500).json({ error: "Unable to open document" });
  }
});

router.get("/:id/documents/:field/download", async (req, res) => {
  try {
    return await deliverDocument(req, res, true);
  } catch (error) {
    console.error("Document download failed:", error);
    return res.status(500).json({ error: "Unable to download document" });
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

    const updated = await Application.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });
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

    const updated = await Application.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });
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
    const updated = await Application.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    });
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

      const filePath = path.join(uploadsDir, filename);
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