const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
  name: String,
  email: String,
  education: String,
  program: String,
  goals: String,
  documents: {
    gceOLevel: String,
    gceALevel: String,
    transcript: String,
    attestation: String,
    idCard: String,
  },
  status: { type: String, default: "pending" },
  score: { type: Number, default: 0, min: 0, max: 100 },
  reviewed: { type: Boolean, default: false },
  reviewNote: { type: String, default: "" },
  decisionReason: { type: String, default: "" },
  archivedAt: { type: Date, default: null },
  lastReviewedAt: { type: Date, default: null },
  history: [
    {
      action: String,
      note: String,
      status: String,
      at: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Application", ApplicationSchema);