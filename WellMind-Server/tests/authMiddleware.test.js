// Safe unit test for authMiddleware — uses only Node built-ins (assert).
// Does NOT touch MongoDB, does NOT start a server, does NOT read any secret.
// Run: node --input-type=module server/tests/authMiddleware.test.js
import assert from "node:assert";
import jwt from "jsonwebtoken";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const authMiddleware = require("../middleware/authMiddleware.js").default;

const SECRET = process.env.JWT_SECRET || "default-test-secret"; // test-local value, never persisted
process.env.JWT_SECRET = SECRET; // keep test and middleware in sync without touching .env
const userId = "user-123";
const token = jwt.sign({ userId }, SECRET, { expiresIn: "1h" });

let passed = 0;
let failed = 0;

function run(label, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS: ${label}`);
  } catch (e) {
    failed++;
    console.log(`FAIL: ${label} -> ${e.message}`);
  }
}

function mockReq(headers = {}) {
  return { header: (name) => headers[name] ?? null };
}

function mockRes() {
  const res = {};
  res.status = (code) => { res._status = code; return res; };
  res.json = (body) => { res._body = body; return res; };
  return res;
}

// 1. Missing token -> 401
run("missing token returns 401", () => {
  const req = mockReq();
  const res = mockRes();
  let calledNext = false;
  authMiddleware(req, res, () => { calledNext = true; });
  assert.strictEqual(res._status, 401);
  assert.strictEqual(calledNext, false);
});

// 2. Raw token (no Bearer) -> sets req.user and calls next
run("raw token sets req.user", () => {
  const req = mockReq({ Authorization: token });
  const res = mockRes();
  let calledNext = false;
  authMiddleware(req, res, () => { calledNext = true; });
  assert.strictEqual(calledNext, true);
  assert.strictEqual(req.user, userId);
});

// 3. "Bearer <token>" -> sets req.user and calls next (fixes frontend mismatch)
run("Bearer token sets req.user", () => {
  const req = mockReq({ Authorization: `Bearer ${token}` });
  const res = mockRes();
  let calledNext = false;
  authMiddleware(req, res, () => { calledNext = true; });
  assert.strictEqual(calledNext, true);
  assert.strictEqual(req.user, userId);
});

// 4. "Bearer " with extra whitespace -> still works
run("Bearer token with extra whitespace", () => {
  const req = mockReq({ Authorization: `Bearer   ${token}` });
  const res = mockRes();
  authMiddleware(req, res, () => {});
  assert.strictEqual(req.user, userId);
});

// 5. Expired/invalid token -> 401
run("invalid token returns 401", () => {
  const req = mockReq({ Authorization: "not-a-real-token" });
  const res = mockRes();
  let calledNext = false;
  authMiddleware(req, res, () => { calledNext = true; });
  assert.strictEqual(res._status, 401);
  assert.strictEqual(calledNext, false);
});

run("expired token returns 401", () => {
  const expired = jwt.sign({ userId, exp: Math.floor(Date.now() / 1000) - 60 }, SECRET);
  const req = mockReq({ Authorization: `Bearer ${expired}` });
  const res = mockRes();
  let calledNext = false;
  authMiddleware(req, res, () => { calledNext = true; });
  assert.strictEqual(res._status, 401);
  assert.strictEqual(calledNext, false);
  assert.match(res._body.msg, /expired/i);
});

run("token without userId returns 401", () => {
  const bare = jwt.sign({ role: "guest" }, SECRET, { expiresIn: "1h" });
  const req = mockReq({ Authorization: `Bearer ${bare}` });
  const res = mockRes();
  let calledNext = false;
  authMiddleware(req, res, () => { calledNext = true; });
  assert.strictEqual(res._status, 401);
  assert.strictEqual(calledNext, false);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);