const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const { createCsvStore } = require("../models/csvStore");

test("application records can be created, read, updated, and deleted using CSV", async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "njsif-csv-"));
  const store = createCsvStore({ dataDir });

  const created = await store.createApplication({
    name: "Ama Boateng",
    email: "ama@example.com",
    education: "High School",
    program: "Undergraduate",
    goals: "Study medicine",
    documents: { transcript: "transcript.pdf" },
  });

  assert.match(created._id, /^/);
  assert.equal(created.status, "pending");
  assert.equal(created.documents.transcript, "transcript.pdf");

  const listed = await store.listApplications();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, "Ama Boateng");

  const updated = await store.updateApplication(created._id, {
    status: "accepted",
    reviewNote: "Strong academic profile",
  });
  assert.equal(updated.status, "accepted");
  assert.equal(updated.reviewNote, "Strong academic profile");

  await store.deleteApplication(created._id);
  assert.deepEqual(await store.listApplications(), []);
});

test("testimonial records persist in CSV", async () => {
  const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "njsif-testimonials-"));
  const store = createCsvStore({ dataDir });

  const created = await store.createTestimonial({
    name: "Kwame Boateng",
    location: "Accra",
    program: "Undergraduate",
    quote: "The scholarship opened doors.",
    outcome: "University admission",
  });

  const listed = await store.listTestimonials();
  assert.equal(listed.length, 1);
  assert.equal(listed[0]._id, created._id);
  assert.equal(listed[0].quote, "The scholarship opened doors.");
});
