const router = require("express").Router();
const Application = require("../models/Application");

router.get("/applications", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load applications" });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const applications = await Application.find().sort({ createdAt: -1 });

    const byEducation = applications.reduce((acc, item) => {
      const key = item.education || "Other";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    res.json({
      total: applications.length,
      pending: applications.filter((item) => item.status === "pending").length,
      accepted: applications.filter((item) => item.status === "accepted").length,
      rejected: applications.filter((item) => item.status === "rejected").length,
      byEducation,
      recent: applications.slice(0, 5),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to load dashboard summary" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Unable to update application" });
  }
});

module.exports = router;