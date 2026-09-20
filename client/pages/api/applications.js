export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData = await req.formData();
    const backendUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

    const upstreamResponse = await fetch(`${backendUrl}/api/applications`, {
      method: "POST",
      body: formData,
    });

    const payload = await upstreamResponse.json().catch(() => ({}));

    if (!upstreamResponse.ok) {
      return res.status(upstreamResponse.status).json(payload);
    }

    return res.status(upstreamResponse.status).json(payload);
  } catch (error) {
    console.error("Application proxy failed:", error);
    return res.status(502).json({ error: "The application service is unavailable. Please try again later." });
  }
}
