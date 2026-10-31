import assert from "node:assert";
import rateLimit from "../middleware/rateLimit.js";

let passed = 0;
let failed = 0;

function run(label, fn) {
  try {
    fn();
    passed++;
    console.log(`PASS: ${label}`);
  } catch (error) {
    failed++;
    console.log(`FAIL: ${label} -> ${error.message}`);
  }
}

function call(limiter, ip) {
  let status = 200;
  let nextCalled = false;
  const res = {
    set() {},
    status(code) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  };
  limiter({ ip }, res, () => {
    nextCalled = true;
  });
  return { status, nextCalled };
}

run("allows requests up to the limit then returns 429", () => {
  const limiter = rateLimit({ windowMs: 60000, max: 3 });
  for (let i = 0; i < 3; i++) assert.strictEqual(call(limiter, "1.1.1.1").nextCalled, true);
  const blocked = call(limiter, "1.1.1.1");
  assert.strictEqual(blocked.status, 429);
  assert.strictEqual(blocked.nextCalled, false);
});

run("limits each key independently", () => {
  const limiter = rateLimit({ windowMs: 60000, max: 1 });
  assert.strictEqual(call(limiter, "a").nextCalled, true);
  assert.strictEqual(call(limiter, "b").nextCalled, true);
  assert.strictEqual(call(limiter, "a").status, 429);
});

console.log(`\n${passed} passed, ${failed} failed`);
if (failed) process.exit(1);
process.exit(0);
