const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: String,
  program: String,
  quote: { type: String, required: true },
  outcome: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Testimonial", TestimonialSchema);
