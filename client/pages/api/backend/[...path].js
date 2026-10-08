const backendUrl = (process.env.API_URL || "http://localhost:5000").replace(/\/$/, "");

const hopHeaders = new Set([
  "connection",
  "content-length",
  "host",
  "origin",
  "transfer-encoding",
]);

export default async function handler(req, res) {
  const path = Array.isArray(req.query?.path)
    ? req.query.path.join("/")
    : req.query?.path || "";
  const upstreamUrl = `${backendUrl}/api/${path}`;
  const forwardedHeaders = Object.fromEntries(
    Object.entries(req.headers).filter(([name]) => !hopHeaders.has(name))
  );
  const requestInit = {
    method: req.method,
    headers: forwardedHeaders,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = req.body ?? await new Promise((resolve, reject) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
      req.on("error", reject);
    });

    requestInit.body = body instanceof Uint8Array
      ? body
      : typeof body === "string"
        ? body
        : JSON.stringify(body);
  }

  try {
    const upstreamResponse = await fetch(upstreamUrl, requestInit);
    const responseBody = await upstreamResponse.arrayBuffer();
    const responseHeaders = Object.fromEntries(
      upstreamResponse.headers.entries()
    );

    res.status(upstreamResponse.status);
    for (const [name, value] of Object.entries(responseHeaders)) {
      if (!hopHeaders.has(name)) {
        res.setHeader(name, value);
      }
    }

    if (responseBody.byteLength > 0) {
      res.send(Buffer.from(responseBody));
    } else {
      res.end();
    }
  } catch (error) {
    console.error("Backend proxy failed:", error);
    res.status(502).json({
      error: "The application service is unavailable.",
      detail: process.env.NODE_ENV !== "production" ? error.message : undefined,
    });
  }
}
