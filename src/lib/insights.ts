import { MOOD_VALUES, startOfLocalDay } from './moodStats.ts';

interface InsightEntry {
  mood: string;
  date: string | Date;
}

export interface Insight {
  text: string;
  tone: 'gentle' | 'positive' | 'neutral';
}

function dayKey(date: Date): number {
  return startOfLocalDay(date).getTime();
}

/** One short, honest sentence derived only from saved check-ins. */
export function dailyInsight(entries: InsightEntry[], now = new Date()): Insight {
  if (entries.length === 0) {
    return { text: 'Your first check-in takes three seconds. Tap a mood above to begin.', tone: 'neutral' };
  }

  const byDay = new Map<number, number[]>();
  entries.forEach((entry) => {
    const key = dayKey(new Date(entry.date));
    const values = byDay.get(key) || [];
    values.push(MOOD_VALUES[String(entry.mood)] || 3);
    byDay.set(key, values);
  });

  const dayMs = 24 * 60 * 60 * 1000;
  const today = dayKey(now);
  const average = (key: number) => {
    const values = byDay.get(key);
    return values ? values.reduce((a, b) => a + b, 0) / values.length : null;
  };

  const todayAvg = average(today);
  const yesterdayAvg = average(today - dayMs);

  if (todayAvg !== null && yesterdayAvg !== null && todayAvg <= 2 && yesterdayAvg <= 2) {
    return {
      text: 'You have logged low moods two days in a row. That is okay. Try one small thing you can control today.',
      tone: 'gentle',
    };
  }
  if (todayAvg !== null && yesterdayAvg !== null && todayAvg - yesterdayAvg >= 1) {
    return { text: 'Your mood is lighter than yesterday. Notice what helped.', tone: 'positive' };
  }
  if (todayAvg !== null && todayAvg >= 4) {
    return { text: 'You are feeling good today. A great moment to jot down what is going well.', tone: 'positive' };
  }
  if (todayAvg !== null && todayAvg <= 2) {
    return { text: 'Today feels heavy. A slow breath or a chat with the companion can help.', tone: 'gentle' };
  }
  if (todayAvg === null) {
    return { text: 'You have not checked in today yet. How are you feeling right now?', tone: 'neutral' };
  }
  return { text: 'You have checked in today. Small, steady check-ins build a clearer picture over time.', tone: 'neutral' };
}

/** Last `days` days (oldest first) with the average mood value, or null where nothing was logged. */
export function heatmapDays(entries: InsightEntry[], days = 30, now = new Date()) {
  const dayMs = 24 * 60 * 60 * 1000;
  const today = dayKey(now);
  const byDay = new Map<number, number[]>();
  entries.forEach((entry) => {
    const key = dayKey(new Date(entry.date));
    const values = byDay.get(key) || [];
    values.push(MOOD_VALUES[String(entry.mood)] || 3);
    byDay.set(key, values);
  });
  return Array.from({ length: days }, (_, i) => {
    const key = today - (days - 1 - i) * dayMs;
    const values = byDay.get(key);
    return {
      date: new Date(key),
      average: values ? values.reduce((a, b) => a + b, 0) / values.length : null,
    };
  });
}
