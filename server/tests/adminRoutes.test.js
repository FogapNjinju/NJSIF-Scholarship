const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { requireAdminAuth } = require("../middleware/adminAuth");
const adminRoutes = require("../routes/adminRoutes");

test("admin login sets an HttpOnly session cookie required by protected routes", async () => {
  const env = {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  };
  process.env.ADMIN_EMAIL = "admin@example.com";
  process.env.ADMIN_PASSWORD = "integration-test-password";
  process.env.ADMIN_SESSION_SECRET = "integration-test-session-secret-long-enough";
  process.env.NODE_ENV = "test";

  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes);
  app.get("/protected", requireAdminAuth, (req, res) => res.json({ email: req.admin.email }));
  const server = app.listen(0);

  try {
    await new Promise((resolve) => server.once("listening", resolve));
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const rejectedLogin = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "wrong" }),
    });
    assert.equal(rejectedLogin.status, 401);

    const login = await fetch(`${baseUrl}/api/admin/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@example.com", password: "integration-test-password" }),
    });
    assert.equal(login.status, 200);
    const cookieHeader = login.headers.get("set-cookie");
    assert.match(cookieHeader, /HttpOnly/i);
    const cookie = cookieHeader.split(";")[0];

    assert.equal((await fetch(`${baseUrl}/protected`)).status, 401);
    const protectedResponse = await fetch(`${baseUrl}/protected`, { headers: { cookie } });
    assert.equal(protectedResponse.status, 200);
    assert.deepEqual(await protectedResponse.json(), { email: "admin@example.com" });
  } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
    for (const [name, value] of Object.entries(env)) {
      if (typeof value === "undefined") delete process.env[name];
      else process.env[name] = value;
    }
  }
});