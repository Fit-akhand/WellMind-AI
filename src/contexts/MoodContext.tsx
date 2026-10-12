import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { MoodEntry, MoodContextType } from '../types';
import { createMood, listMoods } from '../api/mood';
import { useAuth } from './AuthContext';
import { ApiError } from '../api/client';
import { computeMoodStats } from '../lib/moodStats';

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const VALID_MOODS = new Set(['verySad', 'sad', 'neutral', 'happy', 'veryHappy']);

function cacheKey(userId: string) {
  return `moodEntries:${userId}`;
}

function mapRemote(entries: { _id?: string; id?: string; mood: string; note?: string; date?: string }[]): MoodEntry[] {
  return entries
    .filter((e) => VALID_MOODS.has(String(e.mood)))
    .map((e) => ({
      id: String(e._id || e.id),
      mood: e.mood,
      note: e.note || '',
      notes: e.note || '',
      date: new Date(e.date || Date.now()),
    }));
}

interface MoodProviderProps {
  children: ReactNode;
}

export const MoodProvider: React.FC<MoodProviderProps> = ({ children }) => {
  const { user, isLoading: authLoading } = useAuth();
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setMoodEntries([]);
      setHydrated(false);
      setLoadError(null);
      return;
    }

    let initial: MoodEntry[] = [];
    const stored = localStorage.getItem(cacheKey(user.id));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        initial = parsed.map((e: MoodEntry) => ({
          ...e,
          date: new Date(e.date),
          note: e.note || e.notes || '',
          notes: e.note || e.notes || '',
        }));
      } catch {
        initial = [];
      }
    }
    setMoodEntries(initial);
    setHydrated(true);

    listMoods()
      .then((remote) => {
        if (Array.isArray(remote)) {
          setMoodEntries(mapRemote(remote));
          setLoadError(null);
        }
      })
      .catch(() => {
        setLoadError('Mood history could not be refreshed from the server. Showing saved entries from this browser if available.');
      });
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || !hydrated) return;
    try {
      localStorage.setItem(cacheKey(user.id), JSON.stringify(moodEntries));
    } catch {
      // ignore quota
    }
  }, [moodEntries, user, hydrated]);

  const addMoodEntry = async (entry: Omit<MoodEntry, 'id'>) => {
    const created = await createMood({
      mood: String(entry.mood),
      note: entry.note || entry.notes || '',
      date: entry.date,
    });
    const mapped = mapRemote([created])[0];
    if (!mapped) {
      throw new ApiError('The server returned an invalid mood entry.', 500);
    }
    setMoodEntries((prev) => [mapped, ...prev]);
  };

  const getMoodStats = useCallback(
    () => computeMoodStats(moodEntries.map((entry) => ({ mood: String(entry.mood), date: entry.date }))),
    [moodEntries]
  );

  const value: MoodContextType = {
    moodEntries,
    moodStats: getMoodStats(),
    addMoodEntry,
    getMoodStats,
    loadError,
  };

  return <MoodContext.Provider value={value}>{children}</MoodContext.Provider>;
};

export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (context === undefined) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
