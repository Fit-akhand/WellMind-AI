import assert from "node:assert";
import { isValidMood, moodSyncKey, parseMoodDate } from "../lib/moods.js";
import { validateSurveyResponses } from "../lib/surveyValidation.js";
import { isSameAccount } from "../lib/access.js";

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

const questions = [
  { id: "q1", type: "scale" },
  { id: "q2", type: "scale" },
];

run("accepts supported moods only", () => {
  assert.strictEqual(isValidMood("happy"), true);
  assert.strictEqual(isValidMood("joyful"), false);
  assert.strictEqual(isValidMood(3), false);
});

run("rejects an unparseable mood date", () => {
  assert.strictEqual(parseMoodDate("not-a-date"), null);
  assert.ok(parseMoodDate(undefined) instanceof Date);
});

run("mood sync key matches identical records", () => {
  const date = new Date("2026-01-02T00:00:00.000Z");
  const left = moodSyncKey({ mood: "sad", note: "a", date });
  const right = moodSyncKey({ mood: "sad", note: "a", date: "2026-01-02T00:00:00.000Z" });
  assert.strictEqual(left, right);
  assert.notStrictEqual(left, moodSyncKey({ mood: "happy", note: "a", date }));
});

run("survey requires every question and a 0-3 scale", () => {
  const missing = validateSurveyResponses(questions, [{ questionId: "q1", answer: 1 }]);
  assert.strictEqual(missing.ok, false);

  const badScale = validateSurveyResponses(questions, [
    { questionId: "q1", answer: 9 },
    { questionId: "q2", answer: 1 },
  ]);
  assert.strictEqual(badScale.ok, false);

  const ok = validateSurveyResponses(questions, [
    { questionId: "q1", answer: 0 },
    { questionId: "q2", answer: "3" },
  ]);
  assert.strictEqual(ok.ok, true);
  assert.deepStrictEqual(ok.responses, [
    { questionId: "q1", answer: 0 },
    { questionId: "q2", answer: 3 },
  ]);
});

run("account access compares authenticated identity", () => {
  assert.strictEqual(isSameAccount("abc", "abc"), true);
  assert.strictEqual(isSameAccount("abc", "def"), false);
  assert.strictEqual(isSameAccount(undefined, "abc"), false);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
