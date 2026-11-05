const crypto = require("node:crypto");

const SESSION_COOKIE = "njsif_admin_session";
const SESSION_DURATION_SECONDS = 12 * 60 * 60;
const MIN_SECRET_LENGTH = 32;

const safeEqual = (left, right) => {
  const leftHash = crypto.createHash("sha256").update(String(left)).digest();
  const rightHash = crypto.createHash("sha256").update(String(right)).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
};

const createSessionToken = (email, secret, now = Date.now()) => {
  const payload = Buffer.from(JSON.stringify({
    email,
    expiresAt: Math.floor(now / 1000) + SESSION_DURATION_SECONDS,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
};

const verifySessionToken = (token, secret, now = Date.now()) => {
  if (!token || !secret) return null;

  const [payload, signature, extra] = String(token).split(".");
  if (!payload || !signature || extra) return null;

  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest();
  let actualSignature;
  try {
    actualSignature = Buffer.from(signature, "base64url");
  } catch (error) {
    return null;
  }

  if (actualSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(actualSignature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (typeof session.email !== "string" || session.expiresAt <= Math.floor(now / 1000)) return null;
    return session;
  } catch (error) {
    return null;
  }
};

const getCookieValue = (cookieHeader = "", cookieName = SESSION_COOKIE) => {
  for (const entry of cookieHeader.split(";")) {
    const separator = entry.indexOf("=");
    if (separator < 0 || entry.slice(0, separator).trim() !== cookieName) continue;

    try {
      return decodeURIComponent(entry.slice(separator + 1).trim());
    } catch (error) {
      return "";
    }
  }

  return "";
};

const isAdminAuthConfigured = (env = process.env) =>
  Boolean(
    env.ADMIN_EMAIL?.trim() &&
    env.ADMIN_PASSWORD &&
    env.ADMIN_SESSION_SECRET?.length >= MIN_SECRET_LENGTH
  );

const setSessionCookie = (res, token, env = process.env) => {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_DURATION_SECONDS}${secure}`
  );
};

const clearSessionCookie = (res, env = process.env) => {
  const secure = env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure}`
  );
};

const requireAdminAuth = (req, res, next) => {
  if (!isAdminAuthConfigured()) {
    return res.status(503).json({ error: "Admin authentication is not configured." });
  }

  const token = getCookieValue(req.headers.cookie || "");
  const session = verifySessionToken(token, process.env.ADMIN_SESSION_SECRET);
  if (!session) {
    return res.status(401).json({ error: "Admin authentication required." });
  }

  req.admin = { email: session.email };
  return next();
};

module.exports = {
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  clearSessionCookie,
  createSessionToken,
  getCookieValue,
  isAdminAuthConfigured,
  requireAdminAuth,
  safeEqual,
  setSessionCookie,
  verifySessionToken,
};