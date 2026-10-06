const backendUrl = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstreamResponse = await fetch(`${backendUrl}/api/testimonials`, {
      method: req.method,
      ...(req.method === "POST" ? {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body || {}),
      } : {}),
    });
    const payload = await upstreamResponse.json().catch(() => ({}));
    return res.status(upstreamResponse.status).json(payload);
  } catch (error) {
    console.error("Testimonial proxy failed:", error);
    return res.status(502).json({ error: "The testimonial service is unavailable. Please try again later." });
  }
}
