const router = require("express").Router();
const Testimonial = require("../models/Testimonial");

router.get("/", async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load testimonials" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, location, program, quote, outcome } = req.body || {};

    if (!name || !quote) {
      return res.status(400).json({ error: "Name and testimonial message are required." });
    }

    const testimonial = new Testimonial({ name, location, program, quote, outcome });
    await testimonial.save();

    res.status(201).json(testimonial);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to submit testimonial" });
  }
});

module.exports = router;
