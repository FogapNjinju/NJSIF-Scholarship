const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, default: "" },
    education: { type: String, default: "" },
    program: { type: String, default: "" },
    goals: { type: String, default: "" },
    documents: {
      gceOLevel: { type: String, default: "" },
      gceALevel: { type: String, default: "" },
      transcript: { type: String, default: "" },
      attestation: { type: String, default: "" },
      idCard: { type: String, default: "" },
    },
    status: { type: String, default: "pending" },
    score: { type: Number, default: 0 },
    reviewed: { type: Boolean, default: false },
    reviewNote: { type: String, default: "" },
    decisionReason: { type: String, default: "" },
    archivedAt: { type: Date, default: null },
    lastReviewedAt: { type: Date, default: null },
    history: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { timestamps: true }
);

const normalizeMongoUpdatePayload = (updatePayload = {}) => {
  if (!updatePayload || typeof updatePayload !== "object" || Array.isArray(updatePayload)) {
    return { $set: updatePayload || {} };
  }

  const hasMongoOperators = Object.keys(updatePayload).some((key) => key.startsWith("$") || key === "_id");
  return hasMongoOperators ? updatePayload : { $set: updatePayload };
};

const originalFindByIdAndUpdate = mongoose.Model.findByIdAndUpdate;

applicationSchema.statics.findByIdAndUpdate = function findByIdAndUpdate(id, updatePayload, options = {}) {
  return originalFindByIdAndUpdate.call(this, id, normalizeMongoUpdatePayload(updatePayload), {
    new: true,
    runValidators: true,
    ...options,
  });
};

module.exports = mongoose.model("Application", applicationSchema);
