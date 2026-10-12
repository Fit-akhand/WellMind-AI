export const MOOD_VALUES: Record<string, number> = {
  verySad: 1,
  sad: 2,
  neutral: 3,
  happy: 4,
  veryHappy: 5,
};

export interface MoodStatInput {
  mood: string;
  date: string | Date;
}

export interface MoodStatSummary {
  moodCounts: Record<string, number>;
  recentTrend: 'improving' | 'declining' | 'stable';
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function computeMoodStats(entries: MoodStatInput[]): MoodStatSummary {
  const moodCounts: Record<string, number> = {
    verySad: 0,
    sad: 0,
    neutral: 0,
    happy: 0,
    veryHappy: 0,
  };

  entries.forEach((entry) => {
    const key = String(entry.mood);
    if (key in moodCounts) moodCounts[key] += 1;
  });

  const recentEntries = [...entries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  if (recentEntries.length < 2) {
    return { moodCounts, recentTrend: 'stable' };
  }

  const midpoint = Math.floor(recentEntries.length / 2);
  const older = recentEntries.slice(midpoint);
  const newer = recentEntries.slice(0, midpoint);
  const average = (group: MoodStatInput[]) =>
    group.reduce((sum, entry) => sum + (MOOD_VALUES[String(entry.mood)] || 3), 0) / group.length;

  const newerAvg = average(newer);
  const olderAvg = average(older);
  let recentTrend: MoodStatSummary['recentTrend'] = 'stable';
  if (newerAvg - olderAvg > 0.5) recentTrend = 'improving';
  else if (olderAvg - newerAvg > 0.5) recentTrend = 'declining';

  return { moodCounts, recentTrend };
}

/** Inclusive local-calendar window ending today. `days` of 7 includes today and the previous 6 days. */
export function entriesInLocalWindow<T extends { date: string | Date }>(
  entries: T[],
  days: number,
  now = new Date()
): T[] {
  const start = startOfLocalDay(now);
  start.setDate(start.getDate() - (days - 1));
  const end = new Date(startOfLocalDay(now).getTime() + 24 * 60 * 60 * 1000);
  return entries.filter((entry) => {
    const time = new Date(entry.date).getTime();
    return time >= start.getTime() && time < end.getTime();
  });
}
