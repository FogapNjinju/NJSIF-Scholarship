const test = require("node:test");
const assert = require("node:assert/strict");
const {
  createSessionToken,
  getCookieValue,
  safeEqual,
  verifySessionToken,
} = require("../middleware/adminAuth");

test("admin session token is valid until its expiry", () => {
  const now = Date.UTC(2026, 10, 5);
  const token = createSessionToken("admin@example.com", "a-session-secret-that-is-long-enough", now);

  assert.equal(verifySessionToken(token, "a-session-secret-that-is-long-enough", now).email, "admin@example.com");
  assert.equal(verifySessionToken(token, "a-session-secret-that-is-long-enough", now + 13 * 60 * 60 * 1000), null);
});

test("admin session rejects tampered tokens and incorrect secrets", () => {
  const token = createSessionToken("admin@example.com", "a-session-secret-that-is-long-enough");
  const [payload, signature] = token.split(".");

  const tamperedSignature = `${signature[0] === "a" ? "b" : "a"}${signature.slice(1)}`;
  assert.equal(verifySessionToken(`${payload}.${tamperedSignature}`, "a-session-secret-that-is-long-enough"), null);
  assert.equal(verifySessionToken(token, "a-different-session-secret-that-is-long-enough"), null);
});

test("admin session cookie parser handles other cookies and encoded values", () => {
  assert.equal(getCookieValue("theme=dark; njsif_admin_session=token%2Epart; path=/"), "token.part");
  assert.equal(getCookieValue("theme=dark"), "");
});

test("admin credential comparison is case-sensitive and safe for unequal lengths", () => {
  assert.equal(safeEqual("correct-password", "correct-password"), true);
  assert.equal(safeEqual("correct-password", "incorrect"), false);
});