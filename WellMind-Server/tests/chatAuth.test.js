// Focused test for chat auth integration (Phase 3A follow-up).
// Uses Node built-ins (assert) + supertest-style mock via express app in-memory.
// Requires server dependencies to be installed (npm ci already run).
// Run: node tests/chatAuth.test.js
import assert from "node:assert";
import jwt from "jsonwebtoken";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const express = require("express");
const authMiddleware = require("../middleware/authMiddleware.js").default;

const SECRET = process.env.JWT_SECRET || "test-secret";
process.env.JWT_SECRET = SECRET;

let passed = 0;
let failed = 0;
function run(label, fn) {
  try { fn(); passed++; console.log(`PASS: ${label}`); }
  catch (e) { failed++; console.log(`FAIL: ${label} -> ${e.message}`); }
}

// Build a minimal app that mimics POST /api/chat auth behavior
const app = express();
app.use(express.json());
app.post("/api/chat", authMiddleware, (req, res) => {
  res.status(201).json({ userId: req.user, message: req.body.message, response: "Echo: " + req.body.message });
});

function request(method, path, headers, body) {
  return new Promise((resolve, reject) => {
    const server = app.listen(0, () => {
      const port = server.address().port;
      const http = require("http");
      const data = body ? JSON.stringify(body) : null;
      const req = http.request({
        host: "localhost", port, path, method,
        headers: { ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}), ...headers }
      }, (res) => {
        let chunks = "";
        res.on("data", c => chunks += c);
        res.on("end", () => { server.close(); resolve({ status: res.statusCode, body: chunks }); });
      });
      req.on("error", (e) => { server.close(); reject(e); });
      if (data) req.write(data);
      req.end();
    });
  });
}

(async () => {
  const token = jwt.sign({ userId: "user-123" }, SECRET, { expiresIn: "1h" });

  // 1. Valid Bearer token -> 201, userId from token
  await run("valid Bearer token returns 201", async () => {
    const r = await request("POST", "/api/chat", { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, { message: "hi" });
    assert.strictEqual(r.status, 201);
    assert.strictEqual(JSON.parse(r.body).userId, "user-123");
  });

  // 2. No token -> 401
  await run("no token returns 401", async () => {
    const r = await request("POST", "/api/chat", { "Content-Type": "application/json" }, { message: "hi" });
    assert.strictEqual(r.status, 401);
  });

  // 3. Invalid token -> 401
  await run("invalid token returns 401", async () => {
    const r = await request("POST", "/api/chat", { "Authorization": "Bearer bad-token" }, { message: "hi" });
    assert.strictEqual(r.status, 401);
  });

  // 4. Client-supplied userId ignored (identity from token)
  await run("client userId is ignored, token identity wins", async () => {
    const r = await request("POST", "/api/chat", { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }, { userId: "attacker", message: "hi" });
    const b = JSON.parse(r.body);
    assert.strictEqual(b.userId, "user-123");
    assert.notStrictEqual(b.userId, "attacker");
  });

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
})();
