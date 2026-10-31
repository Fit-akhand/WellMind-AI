import React from 'react';
import { useMood } from '../contexts/MoodContext';
import { useSurvey } from '../contexts/SurveyContext';
import { entriesInLocalWindow } from '../lib/moodStats';
import { heatmapDays } from '../lib/insights';
import { SUPPORT_LIMITATION } from '../lib/supportCopy';

const Stat: React.FC<{ label: string; value: string; hint: string }> = ({ label, value, hint }) => (
  <div className="rounded-2xl bg-surface border border-line p-5">
    <p className="text-xs uppercase tracking-wide text-ink-mute font-semibold">{label}</p>
    <p className="font-display text-2xl font-semibold text-ink mt-1 capitalize break-words">{value}</p>
    <p className="text-xs text-ink-mute mt-1">{hint}</p>
  </div>
);

const ProgressSection: React.FC = () => {
  const { moodEntries, getMoodStats, loadError } = useMood();
  const { surveyResults } = useSurvey();
  const stats = getMoodStats();
  const weekEntries = entriesInLocalWindow(moodEntries, 7);
  const monthEntries = entriesInLocalWindow(moodEntries, 30);
  const weekSurveys = entriesInLocalWindow(surveyResults.map((r) => ({ ...r, date: r.date })), 7);

  return (
    <div className="card p-6 sm:p-8 space-y-6">
      {loadError && (
        <p className="text-sm text-coral bg-coral-soft rounded-xl px-4 py-3" role="status">
          {loadError}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat label="Moods, last 7 days" value={String(weekEntries.length)} hint={weekEntries.length === 0 ? 'No entries in this window' : 'Saved mood check-ins'} />
        <Stat label="Moods, last 30 days" value={String(monthEntries.length)} hint="Includes today" />
        <Stat label="Screenings, last 7 days" value={String(weekSurveys.length)} hint={`${surveyResults.length} saved in total`} />
      </div>

      <div className="rounded-2xl bg-surface border border-line p-5">
        <p className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Recent mood trend</p>
        <p className="font-display text-3xl text-ink mt-1 capitalize">{moodEntries.length < 2 ? 'Not enough data' : stats.recentTrend}</p>
        <p className="text-xs text-ink-mute mt-1">
          {moodEntries.length < 2
            ? 'At least two saved moods are needed before a trend is calculated.'
            : 'Compares the newer half of your last 7 saved entries with the older half.'}
        </p>
      </div>

      <div className="rounded-2xl bg-surface border border-line p-5">
        <p className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Last 30 days</p>
        <div className="mt-3 grid gap-1.5" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }} role="img" aria-label="Mood heatmap for the last 30 days">
          {heatmapDays(moodEntries).map(({ date, average }) => (
            <div
              key={date.toISOString()}
              title={`${date.toLocaleDateString()}: ${average === null ? 'no check-in' : `mood ${average.toFixed(1)} of 5`}`}
              className="aspect-square rounded-md"
              style={{
                background:
                  average === null ? 'var(--color-surface-2)' : average <= 2 ? '#f3b79f' : average < 3.5 ? '#bcd9ea' : '#8fd0a4',
              }}
            />
          ))}
        </div>
        <p className="text-xs text-ink-mute mt-3">Warm = heavier days, blue = steady, green = lighter days. Empty squares mean no check-in.</p>
      </div>
      <p className="text-sm text-ink-soft leading-relaxed">{SUPPORT_LIMITATION}</p>
    </div>
  );
};

export default ProgressSection;
