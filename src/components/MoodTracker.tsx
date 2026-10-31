import React, { useState } from 'react';
import { format } from 'date-fns';
import { useMood } from '../contexts/MoodContext';
import {
  SmilePlus,
  Smile,
  Meh,
  Frown,
  Frown as FrownPlus,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type MoodKey = 'verySad' | 'sad' | 'neutral' | 'happy' | 'veryHappy';

const moodIcons: Record<MoodKey, React.ReactNode> = {
  veryHappy: <SmilePlus className="h-7 w-7 text-sage" />,
  happy: <Smile className="h-7 w-7 text-sage" />,
  neutral: <Meh className="h-7 w-7 text-mist" />,
  sad: <Frown className="h-7 w-7 text-coral" />,
  verySad: <FrownPlus className="h-7 w-7 text-coral" />,
};

const moodLabels: Record<MoodKey, string> = {
  veryHappy: 'Very Happy',
  happy: 'Happy',
  neutral: 'Neutral',
  sad: 'Sad',
  verySad: 'Very Sad',
};

const moodBadgeStyles: Record<MoodKey, string> = {
  veryHappy: 'bg-sage-soft text-sage',
  happy: 'bg-sage-soft text-sage',
  neutral: 'bg-mist-soft text-mist',
  sad: 'bg-coral-soft text-coral',
  verySad: 'bg-coral-soft text-coral',
};

interface MoodMotivation {
  emoji: string;
  badge: string;
  title: string;
  message: string;
  tip: string;
  buttonText: string;
  accentBg: string;
}

const MOOD_MOTIVATIONS: Record<MoodKey, MoodMotivation> = {
  veryHappy: {
    emoji: '🥰✨🎉',
    badge: 'Feeling Wonderful',
    title: 'Your light is shining today!',
    message: 'It is so heartwarming to see you feeling joyful and radiant! Celebrate your efforts, big or small. Soak in this good energy—you worked hard and you deserve it!',
    tip: '💡 Tip: Note down one thing that made you smile today in your journal, or share a kind word with a friend.',
    buttonText: 'Keep Shining! 💛',
    accentBg: 'bg-lavender-soft text-lavender-deep',
  },
  happy: {
    emoji: '☀️🌱😊',
    badge: 'Feeling Good',
    title: 'Keep that gentle glow!',
    message: 'Steady, peaceful days build true resilience. You are doing so much better than you give yourself credit for. Be proud of the progress you are making every single day.',
    tip: '💡 Tip: Take a slow, refreshing breath and remind yourself: "I am growing at my own right pace."',
    buttonText: 'Thank you, feeling good! 🌿',
    accentBg: 'bg-sage-soft text-sage',
  },
  neutral: {
    emoji: '🕊️🌿😌',
    badge: 'Steady & Centered',
    title: 'Balanced days are beautiful days.',
    message: 'Not every day needs to be intense or high energy. An okay, steady day is a sign of peace and equilibrium. You are showing up for yourself, and that matters.',
    tip: '💡 Tip: Stay well-hydrated, take a brief stretch, and do one tiny thing you enjoy tonight.',
    buttonText: 'Staying grounded 🤍',
    accentBg: 'bg-surface-2 text-ink',
  },
  sad: {
    emoji: '🌧️🫂💙',
    badge: 'Sending Warmth',
    title: 'It is okay to have a low day.',
    message: 'You are so brave for being honest with your feelings. Remember: tough moments and cloudy days do not define your worth or your future. Please be extra kind and gentle with yourself right now.',
    tip: '💡 Tip: Wrap yourself in warmth, sip some water, and remember you do not have to carry everything alone.',
    buttonText: 'Thank you for this 🫂',
    accentBg: 'bg-mist-soft text-mist',
  },
  verySad: {
    emoji: '🌸🛡️💜',
    badge: 'You Are Safe',
    title: 'Take a deep breath. You are not alone.',
    message: 'When placement pressure or life feels overwhelming, please pause. You do NOT have to solve your whole future right this second. You only have to take care of this one breath right now.',
    tip: '💡 Tip: Place a hand gently on your heart, take three slow exhales, and remember: this heavy feeling will pass.',
    buttonText: 'Taking it one breath at a time 🌸',
    accentBg: 'bg-coral-soft text-coral',
  },
};

interface MoodTrackerProps {
  /** Show log, insights and history one after another instead of behind tabs. */
  stacked?: boolean;
}

const MoodTracker: React.FC<MoodTrackerProps> = ({ stacked = false }) => {
  const [note, setNote] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodKey | null>(null);
  const [activeMotivation, setActiveMotivation] = useState<MoodMotivation | null>(null);
  const { addMoodEntry, moodEntries, getMoodStats, loadError } = useMood();
  const [activeTab, setActiveTab] = useState<'entry' | 'history' | 'stats'>('entry');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMood || isSubmitting) return;

    const chosenMood = selectedMood;
    if (MOOD_MOTIVATIONS[chosenMood]) {
      setActiveMotivation(MOOD_MOTIVATIONS[chosenMood]);
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await addMoodEntry({
        date: new Date(),
        mood: chosenMood,
        note,
      });
      setSelectedMood(null);
      setNote('');
      if (!stacked) setActiveTab('history');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'The mood entry could not be saved.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const { moodCounts, recentTrend } = getMoodStats();
  const show = (tab: 'entry' | 'history' | 'stats') => stacked || activeTab === tab;

  const barChartData = {
    labels: (Object.keys(moodLabels) as MoodKey[]).map((k) => moodLabels[k]),
    datasets: [
      {
        label: 'Mood Distribution',
        data: (Object.keys(moodLabels) as MoodKey[]).map((k) => moodCounts[k] || 0),
        backgroundColor: (Object.keys(moodLabels) as MoodKey[]).map((key) =>
          key === 'verySad' || key === 'sad' ? 'rgba(217, 127, 106, 0.45)' : key === 'neutral' ? 'rgba(107, 139, 164, 0.4)' : 'rgba(95, 138, 118, 0.45)'
        ),
        borderColor: (Object.keys(moodLabels) as MoodKey[]).map((key) =>
          key === 'verySad' || key === 'sad' ? '#e8845f' : key === 'neutral' ? '#4f9bc4' : '#5aa874'
        ),
        borderWidth: 1.5,
        borderRadius: 8,
      },
    ],
  };

  const recentEntries = [...moodEntries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7);

  const moodValues: Record<string, number> = {
    verySad: 1,
    sad: 2,
    neutral: 3,
    happy: 4,
    veryHappy: 5,
  };

  const lineChartData = {
    labels: recentEntries.map((entry) => format(new Date(entry.date), 'MMM d')),
    datasets: [
      {
        label: 'Mood Trend',
        data: recentEntries.map((entry) => moodValues[String(entry.mood)] || 3),
        fill: false,
        borderColor: '#3f9c93',
        backgroundColor: '#3f9c93',
        tension: 0.3,
        pointRadius: 4,
        pointBackgroundColor: '#3f9c93',
      },
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 1,
        max: 5,
        ticks: {
          callback: (val) => {
            const map: Record<number, string> = {
              1: 'Very Sad',
              2: 'Sad',
              3: 'Neutral',
              4: 'Happy',
              5: 'Very Happy',
            };
            return map[Number(val)] || '';
          },
        },
        grid: { color: 'rgba(230, 227, 220, 0.6)' },
      },
      x: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  return (
    <div className="card rounded-2xl p-6 sm:p-8">
      {/* Motivational Praise Modal */}
      {activeMotivation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md card rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4 border border-line bg-surface">
            <button
              type="button"
              onClick={() => setActiveMotivation(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-ink-mute hover:text-ink hover:bg-surface-2 transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Cute Emoji & Badge */}
            <div className="mx-auto w-auto px-4 py-2 rounded-2xl bg-surface-2 flex items-center justify-center text-3xl shadow-inner tracking-widest">
              {activeMotivation.emoji}
            </div>

            <div className="space-y-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${activeMotivation.accentBg}`}>
                {activeMotivation.badge}
              </span>
              <h3 className="font-display text-2xl font-bold text-ink mt-2">
                {activeMotivation.title}
              </h3>
            </div>

            <p className="text-sm text-ink-soft leading-relaxed px-1">
              {activeMotivation.message}
            </p>

            <div className="p-3.5 rounded-2xl bg-surface-2/60 text-xs text-ink-mute text-left border border-line/60">
              <p className="leading-relaxed">{activeMotivation.tip}</p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveMotivation(null)}
                className="btn-primary w-full !py-2.5 text-sm"
              >
                {activeMotivation.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}

      {!stacked && (
        <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-line">
        <div>
          <p className="eyebrow">Daily check-in</p>
          <h2 className="font-display text-2xl font-semibold text-ink mt-1">
            Mood Tracker
          </h2>
          <p className="text-sm text-ink-mute mt-0.5">
            Notice patterns and track how you feel over time.
          </p>
        </div>

        <div className="inline-flex rounded-xl bg-surface-2 p-1 border border-line shrink-0">
          {(['entry', 'history', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors duration-fast ${
                activeTab === tab
                  ? 'bg-surface text-ink shadow-sm'
                  : 'text-ink-mute hover:text-ink'
              }`}
            >
              {tab === 'entry' ? 'Log' : tab === 'history' ? 'History' : 'Insights'}
            </button>
          ))}
        </div>
      </div>

        </>
      )}

      {/* Tab: Log Mood */}
      {show('entry') && (
        <form onSubmit={handleSubmit} className={`space-y-6 ${stacked ? '' : 'mt-6'}`}>
          <div>
            <label className="block text-sm font-medium text-ink mb-3">
              How are you feeling right now?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {(Object.keys(moodIcons) as MoodKey[]).map((mood) => {
                const isSelected = selectedMood === mood;
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => setSelectedMood(mood)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-fast ${
                      isSelected
                        ? 'border-lavender bg-lavender-soft shadow-sm scale-[1.02]'
                        : 'border-line bg-surface hover:bg-surface-2'
                    }`}
                  >
                    <div className="mb-2">{moodIcons[mood]}</div>
                    <span className="text-xs font-semibold text-ink">
                      {moodLabels[mood]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="mood-note"
              className="block text-sm font-medium text-ink mb-1.5"
            >
              Note or reflection <span className="text-ink-mute font-normal">(optional)</span>
            </label>
            <textarea
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="input !rounded-xl"
              rows={3}
              placeholder="What’s contributing to how you feel today?"
            />
          </div>

          {submitError && (
            <p className="text-sm text-coral bg-coral-soft rounded-xl px-4 py-3" role="alert">
              {submitError}
            </p>
          )}
          {loadError && (
            <p className="text-sm text-coral bg-coral-soft rounded-xl px-4 py-3" role="status">
              {loadError}
            </p>
          )}

          <button
            type="submit"
            disabled={!selectedMood || isSubmitting}
            className="btn-primary w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : 'Save mood entry'}
          </button>
        </form>
      )}

      {/* Tab: History */}
      {show('history') && (
        <div className={stacked ? 'mt-8 pt-8 border-t border-line' : 'mt-6'}>
          <div className="flex items-center gap-2 mb-4 text-ink-mute">
            <Calendar className="h-4 w-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Recent entries
            </h3>
          </div>

          {moodEntries.length === 0 ? (
            <div className="text-center py-12 rounded-xl bg-surface-2 border border-dashed border-line">
              <p className="text-sm text-ink-mute">
                No entries recorded yet. Take a moment to log your first mood!
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {[...moodEntries]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((entry) => {
                  const mKey = String(entry.mood) as MoodKey;
                  const label = moodLabels[mKey] || entry.mood;
                  const badge = moodBadgeStyles[mKey] || 'bg-surface-2 text-ink';
                  return (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl border border-line bg-surface flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${badge}`}
                        >
                          {moodIcons[mKey] || <Meh className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">{label}</p>
                          <p className="text-xs text-ink-mute">
                            {format(new Date(entry.date), 'MMMM d, yyyy • h:mm a')}
                          </p>
                          {(entry.note || entry.notes) && (
                            <p className="text-xs text-ink-soft mt-1.5 p-2 rounded-lg bg-surface-2">
                              {entry.note || entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Stats */}
      {show('stats') && (
        <div className={`space-y-6 ${stacked ? 'mt-8 pt-8 border-t border-line' : 'mt-6'}`}>
          <div className="flex items-center gap-2 text-ink">
            {recentTrend === 'improving' ? (
              <TrendingUp className="h-5 w-5 text-sage" />
            ) : recentTrend === 'declining' ? (
              <TrendingDown className="h-5 w-5 text-coral" />
            ) : (
              <Minus className="h-5 w-5 text-mist" />
            )}
            <p className="text-sm font-semibold">
              Recent trend:{' '}
              <span className="font-normal capitalize text-ink-soft">
                {recentTrend}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-line bg-surface">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-mute mb-3">
                Last 7 entries
              </h4>
              {moodEntries.length < 2 ? (
                <p className="text-xs text-ink-mute py-12 text-center">
                  Log at least 2 entries to view your trend over time.
                </p>
              ) : (
                <div className="chart-container h-48">
                  <Line data={lineChartData} options={lineChartOptions} />
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl border border-line bg-surface">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-mute mb-3">
                Mood breakdown
              </h4>
              {moodEntries.length === 0 ? (
                <p className="text-xs text-ink-mute py-12 text-center">
                  No mood entries yet.
                </p>
              ) : (
                <div className="chart-container h-48">
                  <Bar
                    data={barChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { grid: { display: false } },
                        y: {
                          ticks: { precision: 0 },
                          grid: { color: 'rgba(230, 227, 220, 0.6)' },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodTracker;
