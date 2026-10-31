import assert from "node:assert/strict";
import test from "node:test";
import { computeMoodStats, entriesInLocalWindow } from "../src/lib/moodStats.ts";
import { DASHBOARD_TABS, tabFromPath } from "../src/lib/routes.ts";
import { safeReturnPath } from "../src/lib/safeReturnPath.ts";

test("dashboard paths map to distinct pages", () => {
  assert.equal(tabFromPath("/dashboard"), "home");
  assert.equal(tabFromPath("/dashboard/chat"), "chat");
  assert.equal(tabFromPath("/dashboard/mood"), "mood");
  assert.equal(tabFromPath("/dashboard/wellness"), "wellness");
  assert.equal(tabFromPath("/dashboard/progress"), "progress");
  assert.equal(tabFromPath("/dashboard/settings"), "settings");
  assert.equal(Object.keys(DASHBOARD_TABS).length, 6);
});

test("login return path stays inside the app", () => {
  assert.equal(safeReturnPath("/dashboard/mood"), "/dashboard/mood");
  assert.equal(safeReturnPath("https://evil.example"), "/dashboard");
  assert.equal(safeReturnPath("//evil.example"), "/dashboard");
  assert.equal(safeReturnPath(undefined), "/dashboard");
});

test("mood trend uses saved entries and stays stable without enough data", () => {
  assert.equal(computeMoodStats([{ mood: "sad", date: "2026-01-01" }]).recentTrend, "stable");
  const improving = computeMoodStats([
    { mood: "verySad", date: "2026-01-01" },
    { mood: "sad", date: "2026-01-02" },
    { mood: "happy", date: "2026-01-03" },
    { mood: "veryHappy", date: "2026-01-04" },
  ]);
  assert.equal(improving.recentTrend, "improving");
  assert.equal(improving.moodCounts.veryHappy, 1);
});

test("local window does not invent entries outside the range", () => {
  const now = new Date(2026, 3, 10, 15, 0, 0);
  const rows = entriesInLocalWindow(
    [
      { mood: "sad", date: new Date(2026, 3, 10, 9) },
      { mood: "happy", date: new Date(2026, 3, 4, 9) },
      { mood: "neutral", date: new Date(2026, 3, 3, 9) },
    ],
    7,
    now
  );
  assert.equal(rows.length, 2);
});

test("daily insight reflects saved check-ins and never invents data", async () => {
  const { dailyInsight, heatmapDays } = await import("../src/lib/insights.ts");
  const now = new Date(2026, 9, 28, 12);
  const yesterday = new Date(2026, 9, 27, 12);

  assert.equal(dailyInsight([], now).tone, "neutral");
  assert.equal(
    dailyInsight([{ mood: "sad", date: now }, { mood: "verySad", date: yesterday }], now).tone,
    "gentle"
  );
  assert.equal(
    dailyInsight([{ mood: "happy", date: now }, { mood: "sad", date: yesterday }], now).tone,
    "positive"
  );

  const days = heatmapDays([{ mood: "happy", date: now }], 30, now);
  assert.equal(days.length, 30);
  assert.equal(days[29].average, 4);
  assert.equal(days[0].average, null);
});
