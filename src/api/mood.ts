import { apiFetch } from './client';

export interface RemoteMood {
  _id?: string;
  id?: string;
  mood: string;
  note?: string;
  date?: string;
}

export const createMood = async (entry: { mood: string; note?: string; date?: string | Date }) => {
  return apiFetch<RemoteMood>('/api/mood', {
    method: 'POST',
    body: JSON.stringify({
      mood: entry.mood,
      note: entry.note || '',
      date: entry.date,
    }),
  });
};

export const listMoods = async () => {
  return apiFetch<RemoteMood[]>('/api/mood');
};

export const syncMoodsToBackend = async (moodEntries: { mood: string; note?: string; date?: string | Date }[]) => {
  return apiFetch<{ inserted: number }>('/api/mood/bulk', {
    method: 'POST',
    body: JSON.stringify({ moodEntries }),
  });
};

export const syncMoodsFromBackend = async () => {
  return apiFetch<RemoteMood[]>('/api/mood/sync');
};

export const clearMoodsInBackend = async () => {
  return apiFetch<{ deleted: boolean }>('/api/mood', { method: 'DELETE' });
};
