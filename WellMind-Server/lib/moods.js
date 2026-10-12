export const VALID_MOODS = ["verySad", "sad", "neutral", "happy", "veryHappy"];

export function isValidMood(mood) {
  return typeof mood === "string" && VALID_MOODS.includes(mood);
}

/** Returns a Date, or null when the client sent a value that cannot be parsed. */
export function parseMoodDate(value) {
  if (value === undefined || value === null || value === "") return new Date();
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export function moodSyncKey(entry) {
  const when = entry.date instanceof Date ? entry.date : new Date(entry.date);
  return `${entry.mood}|${entry.note || ""}|${when.toISOString()}`;
}
