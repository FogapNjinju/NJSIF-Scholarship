const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, default: "" },
    program: { type: String, default: "" },
    quote: { type: String, required: true },
    outcome: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
