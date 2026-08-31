import fs from "fs/promises";
import path from "path";

const filePath = path.join(process.cwd(), "data", "testimonials.json");

async function readTestimonials() {
  try {
    const content = await fs.readFile(filePath, "utf8");
    return JSON.parse(content || "[]");
  } catch {
    return [];
  }
}

async function writeTestimonials(items) {
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf8");
}

export default async function handler(req, res) {
  if (req.method === "GET") {
    const items = await readTestimonials();
    return res.status(200).json(items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  }

  if (req.method === "POST") {
    const { name, location, program, quote, outcome } = req.body || {};

    if (!name || !quote) {
      return res.status(400).json({ error: "Name and testimonial message are required." });
    }

    const items = await readTestimonials();
    const newItem = {
      _id: `${Date.now()}`,
      name,
      location: location || "",
      program: program || "",
      quote,
      outcome: outcome || "",
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await writeTestimonials(items);

    return res.status(201).json(newItem);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
