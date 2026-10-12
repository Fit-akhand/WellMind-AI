import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Mood from "../models/Mood.js";
import { isValidMood, moodSyncKey, parseMoodDate } from "../lib/moods.js";

const router = express.Router();

function serializeMood(entry) {
  return {
    _id: entry._id,
    id: String(entry._id),
    mood: entry.mood,
    note: entry.note || "",
    date: entry.date,
  };
}

router.post("/", authMiddleware, async (req, res) => {
  const { mood, note, date } = req.body;

  if (!isValidMood(mood)) {
    return res.status(400).json({ error: "Mood must be one of: verySad, sad, neutral, happy, veryHappy." });
  }

  const parsedDate = parseMoodDate(date);
  if (!parsedDate) {
    return res.status(400).json({ error: "Mood date is invalid" });
  }

  try {
    const moodEntry = new Mood({
      userId: req.user,
      mood,
      note: typeof note === "string" ? note.slice(0, 2000) : "",
      date: parsedDate,
    });
    await moodEntry.save();
    res.status(201).json(serializeMood(moodEntry));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user }).sort({ date: -1 });
    res.json(moods.map(serializeMood));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user }).sort({ date: 1 });
    const moodCounts = moods.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {});
    const moodTrends = moods.map((entry) => ({
      date: entry.date.toISOString().split("T")[0],
      mood: entry.mood,
    }));
    res.json({ moodCounts, moodTrends });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/bulk", authMiddleware, async (req, res) => {
  const { moodEntries } = req.body;
  try {
    if (!moodEntries || !Array.isArray(moodEntries)) {
      return res.status(400).json({ error: "moodEntries array is required" });
    }
    if (moodEntries.length > 200) {
      return res.status(400).json({ error: "Too many mood entries in one request" });
    }

    const docs = [];
    for (const entry of moodEntries) {
      if (!isValidMood(entry?.mood)) continue;
      const parsedDate = parseMoodDate(entry.date);
      if (!parsedDate) continue;
      docs.push({
        userId: req.user,
        mood: entry.mood,
        note: typeof entry.note === "string" ? entry.note.slice(0, 2000) : "",
        date: parsedDate,
      });
    }
    if (docs.length === 0) {
      return res.status(400).json({ error: "No valid mood entries provided" });
    }

    const existing = await Mood.find({
      userId: req.user,
      date: { $in: docs.map((doc) => doc.date) },
    }).select("mood note date");
    const seen = new Set(existing.map((entry) => moodSyncKey(entry)));
    const fresh = docs.filter((doc) => !seen.has(moodSyncKey(doc)));
    const inserted = fresh.length > 0 ? await Mood.insertMany(fresh) : [];
    res.status(201).json({ inserted: inserted.length, skipped: docs.length - inserted.length });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/sync", authMiddleware, async (req, res) => {
  try {
    const moods = await Mood.find({ userId: req.user }).sort({ date: -1 });
    res.json(moods.map(serializeMood));
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/", authMiddleware, async (req, res) => {
  try {
    await Mood.deleteMany({ userId: req.user });
    res.json({ deleted: true });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
