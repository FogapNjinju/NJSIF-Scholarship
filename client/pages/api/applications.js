export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, education, program, goals } = req.body || {};

  if (!name || !email || !goals) {
    return res.status(400).json({ error: "Name, email, and goals are required." });
  }

  console.log("Received scholarship application:", { name, email, education, program, goals });

  return res.status(201).json({ success: true, message: "Application received." });
}
