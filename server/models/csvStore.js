const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const APPLICATION_FIELDS = [
  "_id",
  "name",
  "email",
  "education",
  "program",
  "goals",
  "documents",
  "status",
  "score",
  "reviewed",
  "reviewNote",
  "decisionReason",
  "archivedAt",
  "lastReviewedAt",
  "history",
  "createdAt",
];

const TESTIMONIAL_FIELDS = [
  "_id",
  "name",
  "location",
  "program",
  "quote",
  "outcome",
  "createdAt",
];

const parseCsv = (content) => {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const nextCharacter = content[index + 1];

    if (character === '"') {
      if (quoted && nextCharacter === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      row.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && nextCharacter === "\n") {
        index += 1;
      }
      row.push(field);
      if (row.some((value) => value !== "")) {
        rows.push(row);
      }
      row = [];
      field = "";
      continue;
    }

    field += character;
  }

  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((value) => value !== "")) {
      rows.push(row);
    }
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
};

const serializeCsv = (headers, records) => {
  const escape = (value) => {
    const normalized =
      value === null || typeof value === "undefined"
        ? ""
        : typeof value === "object"
          ? JSON.stringify(value)
          : String(value);
    return /[",\r\n]/.test(normalized)
      ? `"${normalized.replaceAll('"', '""')}"`
      : normalized;
  };

  const lines = [headers.join(",")];
  records.forEach((record) => {
    lines.push(headers.map((header) => escape(record[header] ?? "")).join(","));
  });
  return `${lines.join("\n")}\n`;
};

const parseJson = (value, fallback = null) => {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const createCsvStore = ({ dataDir = path.join(__dirname, "../data") } = {}) => {
  const applicationFile = path.join(dataDir, "applications.csv");
  const testimonialFile = path.join(dataDir, "testimonials.csv");
  let operationQueue = Promise.resolve();

  const runOperation = (operation) => {
    operationQueue = operationQueue.then(operation, operation);
    return operationQueue;
  };

  const ensureFiles = async () => {
    await fs.mkdir(dataDir, { recursive: true });
    await Promise.all([
      fs.mkdir(path.dirname(applicationFile), { recursive: true }),
      fs.mkdir(path.dirname(testimonialFile), { recursive: true }),
    ]);

    await Promise.all([
      fs.access(applicationFile).then(() => undefined, () =>
        fs.writeFile(applicationFile, serializeCsv(APPLICATION_FIELDS, []))
      ),
      fs.access(testimonialFile).then(() => undefined, () =>
        fs.writeFile(testimonialFile, serializeCsv(TESTIMONIAL_FIELDS, []))
      ),
    ]);
  };

  const readRecords = async (filePath, fields) => {
    await ensureFiles();
    const content = await fs.readFile(filePath, "utf8");
    const rows = parseCsv(content);
    const headers = rows.length > 0 ? Object.keys(rows[0]) : fields;
    if (headers.length === 0) return [];
    return rows.map((row) =>
      Object.fromEntries(
        headers.map((header) => [
          header,
          header === "documents"
            ? parseJson(row[header], {})
            : header === "history"
              ? parseJson(row[header], [])
            : header === "score"
              ? Number(row[header]) || 0
            : header === "reviewed"
              ? row[header] === "true"
              : row[header],
        ])
      )
    );
  };

  const writeRecords = async (filePath, fields, records) => {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temporaryFile = `${filePath}.${crypto.randomUUID()}.tmp`;
    await fs.writeFile(temporaryFile, serializeCsv(fields, records), "utf8");
    await fs.rename(temporaryFile, filePath);
  };

  const createApplication = async (input = {}) => {
    return runOperation(async () => {
      const now = new Date().toISOString();
      const record = {
        _id: crypto.randomUUID(),
        name: input.name || "",
        email: input.email || "",
        education: input.education || "",
        program: input.program || "",
        goals: input.goals || "",
        documents: input.documents || {},
        status: input.status || "pending",
        score: input.score ?? 0,
        reviewed: input.reviewed ?? false,
        reviewNote: input.reviewNote || "",
        decisionReason: input.decisionReason || "",
        archivedAt: input.archivedAt || null,
        lastReviewedAt: input.lastReviewedAt || null,
        history: input.history || [
          {
            action: "Application submitted",
            note: "Initial scholarship application created",
            status: "pending",
            at: now,
          },
        ],
        createdAt: input.createdAt || now,
      };

      const records = await readRecords(applicationFile, APPLICATION_FIELDS);
      records.push(record);
      await writeRecords(applicationFile, APPLICATION_FIELDS, records);
      return record;
    });
  };

  const listApplications = async () =>
    runOperation(async () => {
      const records = await readRecords(applicationFile, APPLICATION_FIELDS);
      return records.sort((left, right) =>
        new Date(right.createdAt || 0) - new Date(left.createdAt || 0)
      );
    });

  const getApplicationById = async (id) =>
    runOperation(async () => {
      const records = await readRecords(applicationFile, APPLICATION_FIELDS);
      return records.find((record) => record._id === id) || null;
    });

  const updateApplication = async (id, payload = {}) =>
    runOperation(async () => {
      const records = await readRecords(applicationFile, APPLICATION_FIELDS);
      const index = records.findIndex((record) => record._id === id);
      if (index === -1) return null;

      const existing = records[index];
      const next = { ...existing };
      const changes = [];
      const updates = payload.$set || payload;

      if (typeof updates.status !== "undefined") {
        next.status = updates.status;
        changes.push({ action: `Status changed to ${updates.status}`, status: updates.status, at: new Date().toISOString() });
      }
      if (typeof updates.score !== "undefined") next.score = updates.score;
      if (typeof updates.reviewed !== "undefined") next.reviewed = updates.reviewed;
      if (typeof updates.reviewNote !== "undefined") next.reviewNote = updates.reviewNote;
      if (typeof updates.decisionReason !== "undefined") next.decisionReason = updates.decisionReason;
      if (typeof updates.archivedAt !== "undefined") next.archivedAt = updates.archivedAt;
      if (typeof updates.lastReviewedAt !== "undefined") next.lastReviewedAt = updates.lastReviewedAt;

      if (updates.status === "archived" && existing.status !== "archived") {
        next.archivedAt = new Date().toISOString();
      } else if (updates.status && updates.status !== "archived" && existing.status === "archived") {
        next.archivedAt = null;
      }

      if (typeof updates.reviewed !== "undefined") {
        changes.push({
          action: updates.reviewed ? "Marked as reviewed" : "Marked as not reviewed",
          status: next.status,
          at: new Date().toISOString(),
        });
      }
      if (typeof updates.reviewNote !== "undefined") {
        changes.push({ action: "Internal review note updated", status: next.status, at: new Date().toISOString() });
      }
      if (typeof updates.decisionReason !== "undefined") {
        changes.push({ action: "Decision reason updated", status: next.status, at: new Date().toISOString() });
      }
      if (typeof updates.score !== "undefined") {
        changes.push({ action: "Applicant score updated", status: next.status, at: new Date().toISOString() });
      }

      if (payload.$push?.history?.$each) {
        changes.push(...payload.$push.history.$each);
      }

      next.history = [...(existing.history || []), ...changes].slice(-100);
      next.lastReviewedAt = new Date().toISOString();
      records[index] = next;
      await writeRecords(applicationFile, APPLICATION_FIELDS, records);
      return next;
    });

  const deleteApplication = async (id) =>
    runOperation(async () => {
      const records = await readRecords(applicationFile, APPLICATION_FIELDS);
      const target = records.find((record) => record._id === id);
      if (!target) return null;
      const remaining = records.filter((record) => record._id !== id);
      await writeRecords(applicationFile, APPLICATION_FIELDS, remaining);
      return target;
    });

  const createTestimonial = async (input = {}) => {
    return runOperation(async () => {
      const record = {
        _id: crypto.randomUUID(),
        name: input.name || "",
        location: input.location || "",
        program: input.program || "",
        quote: input.quote || "",
        outcome: input.outcome || "",
        createdAt: input.createdAt || new Date().toISOString(),
      };
      const records = await readRecords(testimonialFile, TESTIMONIAL_FIELDS);
      records.push(record);
      await writeRecords(testimonialFile, TESTIMONIAL_FIELDS, records);
      return record;
    });
  };

  const listTestimonials = async () =>
    runOperation(async () => {
      const records = await readRecords(testimonialFile, TESTIMONIAL_FIELDS);
      return records.sort((left, right) =>
        new Date(right.createdAt || 0) - new Date(left.createdAt || 0)
      );
    });

  return {
    createApplication,
    listApplications,
    getApplicationById,
    updateApplication,
    deleteApplication,
    createTestimonial,
    listTestimonials,
  };
};

module.exports = { createCsvStore, APPLICATION_FIELDS, TESTIMONIAL_FIELDS };
