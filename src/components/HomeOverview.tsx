import React, { useEffect, useState } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';
import {
  ArrowUp,
  ArrowUpRight,
  Flame,
  Lightbulb,
  CheckCircle2,
  Circle,
  Frown,
  HeartHandshake,
  Meh,
  MessageCircleHeart,
  Smile,
  SmilePlus,
  Wind,
  Eye,
  PenLine,
  Sparkles,
  X,
  Heart,
} from 'lucide-react';
import { useMood } from '../contexts/MoodContext';
import { useAuth } from '../contexts/AuthContext';
import { MOOD_VALUES } from '../lib/moodStats';
import { dailyInsight } from '../lib/insights';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const MOODS = [
  { key: 'verySad', label: 'Overwhelmed', Icon: Frown, tone: 'bg-coral-soft text-coral', color: '#e8845f' },
  { key: 'sad', label: 'Low', Icon: Frown, tone: 'bg-mist-soft text-mist', color: '#4f9bc4' },
  { key: 'neutral', label: 'Okay', Icon: Meh, tone: 'bg-surface-2 text-ink-soft', color: '#9a9fa9' },
  { key: 'happy', label: 'Good', Icon: Smile, tone: 'bg-sage-soft text-sage', color: '#5aa874' },
  { key: 'veryHappy', label: 'Great', Icon: SmilePlus, tone: 'bg-lavender-soft text-lavender-deep', color: '#3f9c93' },
] as const;

const ROUTE_BY_ACTION: Record<string, string> = {
  '#chat': '/dashboard/chat',
  '#mood': '/dashboard/mood',
  '#wellness': '/dashboard/wellness',
};

/** '#journal' focuses the journal on this page; the others open their page. */
function runAction(to: string, e: React.MouseEvent, navigate: NavigateFunction) {
  e.preventDefault();
  if (to === '#journal') document.getElementById('journal-box')?.focus();
  else if (ROUTE_BY_ACTION[to]) navigate(ROUTE_BY_ACTION[to]);
}

const PROMPTS = ['I feel anxious', 'Help me sleep better', 'I need to vent'];

const LOW_MOODS = new Set(['verySad', 'sad']);

interface MoodMotivation {
  emoji: string;
  badge: string;
  title: string;
  message: string;
  tip: string;
  buttonText: string;
  actionText?: string;
  actionRoute?: string;
  accentBg: string;
}

const MOOD_MOTIVATIONS: Record<string, MoodMotivation> = {
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
    actionText: 'Try 2-min Calm Breathing',
    actionRoute: '/dashboard/wellness',
    accentBg: 'bg-mist-soft text-mist',
  },
  verySad: {
    emoji: '🌸🛡️💜',
    badge: 'You Are Safe',
    title: 'Take a deep breath. You are not alone.',
    message: 'When placement pressure or life feels overwhelming, please pause. You do NOT have to solve your whole future right this second. You only have to take care of this one breath right now.',
    tip: '💡 Tip: Place a hand gently on your heart, take three slow exhales, and remember: this heavy feeling will pass.',
    buttonText: 'Taking it one breath at a time 🌸',
    actionText: 'Talk to Support Companion',
    actionRoute: '/dashboard/chat',
    accentBg: 'bg-coral-soft text-coral',
  },
};

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const HomeOverview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { moodEntries, addMoodEntry } = useMood();
  const [saving, setSaving] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [ask, setAsk] = useState('');
  const [activeMotivation, setActiveMotivation] = useState<MoodMotivation | null>(null);

  const journalKey = user ? `journal:${user.id}` : null;
  const [journal, setJournal] = useState('');
  const [journalSaved, setJournalSaved] = useState<string | null>(null);

  useEffect(() => {
    if (!journalKey) return;
    try {
      setJournal(localStorage.getItem(journalKey) || '');
    } catch {
      setJournal('');
    }
  }, [journalKey]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const [journalDoneToday, setJournalDoneToday] = useState(false);
  const [breathDoneToday, setBreathDoneToday] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      setJournalDoneToday(localStorage.getItem(`journalDate:${user.id}`) === todayStr);
      setBreathDoneToday(localStorage.getItem(`breathDate:${user.id}`) === todayStr);
    } catch {
      // storage unavailable: checklist items stay unchecked
    }
  }, [user, todayStr]);

  const saveJournal = () => {
    if (!journalKey) return;
    try {
      localStorage.setItem(journalKey, journal);
      if (journal.trim() && user) {
        localStorage.setItem(`journalDate:${user.id}`, todayStr);
        setJournalDoneToday(true);
      }
      setJournalSaved('Saved on this device');
    } catch {
      setJournalSaved('Could not save in this browser');
    }
  };

  const firstName = user?.name?.split(' ')[0];

  const logMood = async (key: string, label: string) => {
    if (MOOD_MOTIVATIONS[key]) {
      setActiveMotivation(MOOD_MOTIVATIONS[key]);
    }
    setSaving(key);
    setStatus(null);
    try {
      await addMoodEntry({ mood: key, note: '', date: new Date() });
      setStatus(`Saved: ${label}. Thank you for checking in.`);
    } catch {
      setStatus('Could not save your mood right now. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const sorted = [...moodEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latest = sorted[0];

  const since = subDays(new Date(), 30).getTime();
  const recent30 = moodEntries.filter((e) => new Date(e.date).getTime() >= since);
  const counts = MOODS.map((m) => recent30.filter((e) => e.mood === m.key).length);
  const total = counts.reduce((a, b) => a + b, 0);

  const week = Array.from({ length: 7 }, (_, i) => {
    const day = subDays(new Date(), 6 - i);
    const dayKey = format(day, 'yyyy-MM-dd');
    const entries = moodEntries.filter((e) => format(new Date(e.date), 'yyyy-MM-dd') === dayKey);
    const average = entries.length
      ? entries.reduce((sum, e) => sum + (MOOD_VALUES[String(e.mood)] || 3), 0) / entries.length
      : null;
    return { day, average, count: entries.length };
  });
  const logged = week.filter((d) => d.average !== null).length;

  const daysWithEntries = new Set(moodEntries.map((e) => format(new Date(e.date), 'yyyy-MM-dd')));
  // Streak counts back from today, or from yesterday if today has no check-in yet.
  let streak = 0;
  for (let i = daysWithEntries.has(format(new Date(), 'yyyy-MM-dd')) ? 0 : 1; ; i++) {
    if (!daysWithEntries.has(format(subDays(new Date(), i), 'yyyy-MM-dd'))) break;
    streak += 1;
  }

  const insight = dailyInsight(moodEntries);
  const checkedInToday = daysWithEntries.has(todayStr);
  const checklist = [
    { label: 'Check in with your mood', done: checkedInToday, to: null as string | null },
    { label: 'Write in your journal', done: journalDoneToday, to: '#journal' as string | null },
    { label: 'Try a breathing reset', done: breathDoneToday, to: '#wellness' as string | null },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const lowNow = latest ? LOW_MOODS.has(String(latest.mood)) : false;
  const recommendations = lowNow
    ? [
        { text: 'Take 5 slow breaths, longer on the exhale.', to: '#wellness', Icon: Wind, tint: 'bg-coral-soft text-coral' },
        { text: 'Name 5 things you can see right now.', to: '#wellness', Icon: Eye, tint: 'bg-sage-soft text-sage' },
        { text: 'Talk it through with the support companion.', to: '#chat', Icon: MessageCircleHeart, tint: 'bg-lavender-soft text-lavender-deep' },
      ]
    : [
        { text: 'Pause and breathe deeply for one minute.', to: '#wellness', Icon: Wind, tint: 'bg-mist-soft text-mist' },
        { text: 'Write one thing that went well today.', to: '#journal', Icon: PenLine, tint: 'bg-sage-soft text-sage' },
        { text: 'Take a short PHQ-9 or GAD-7 screening.', to: '#wellness', Icon: Eye, tint: 'bg-lavender-soft text-lavender-deep' },
      ];

  const radarData = {
    labels: MOODS.map((m) => m.label),
    datasets: [
      {
        data: counts,
        backgroundColor: 'rgba(63, 156, 147, 0.18)',
        borderColor: '#3f9c93',
        borderWidth: 2,
        pointBackgroundColor: MOODS.map((m) => m.color),
        pointRadius: 4,
      },
    ],
  };

  const submitAsk = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard/chat', { state: { prompt: ask.trim() } });
  };

  const insightTone =
    insight.tone === 'gentle'
      ? 'bg-coral-soft text-[#a4472a]'
      : insight.tone === 'positive'
        ? 'bg-sage-soft text-[#2f6b45]'
        : 'bg-mist-soft text-[#2d6a8c]';

  return (
    <div className="space-y-5">
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

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setActiveMotivation(null)}
                className="btn-primary w-full !py-2.5 text-sm"
              >
                {activeMotivation.buttonText}
              </button>

              {activeMotivation.actionText && activeMotivation.actionRoute && (
                <button
                  type="button"
                  onClick={() => {
                    const route = activeMotivation.actionRoute!;
                    setActiveMotivation(null);
                    navigate(route);
                  }}
                  className="btn-ghost w-full !py-2 text-xs font-semibold text-lavender inline-flex items-center justify-center gap-1.5"
                >
                  <span>{activeMotivation.actionText}</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <section className="hero-gradient rounded-3xl p-6 sm:p-8 shadow-md">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          {streak > 0 && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-sun-soft text-[#9a6a00] text-xs font-semibold px-3 py-1 mb-3">
              <Flame className="h-3.5 w-3.5" aria-hidden /> {streak}-day check-in streak
            </p>
          )}
          <h2 className="font-display text-4xl sm:text-5xl font-semibold text-ink tracking-tight">
            Hi{firstName ? `, ${firstName}` : ''} <span aria-hidden>👋</span>
          </h2>
          <p className="text-ink-soft mt-2 text-lg">
            {greeting()} · {format(new Date(), 'EEEE, d MMMM')}
          </p>
        </div>
        <div className="md:max-w-md">
          <p className="text-ink font-medium mb-3">How are you feeling right now?</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Log your mood with one tap">
            {MOODS.map(({ key, label, Icon, tone }) => (
              <button
                key={key}
                type="button"
                disabled={saving !== null}
                onClick={() => logMood(key, label)}
                className={`mood-chip ${tone}`}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {saving === key ? 'Saving…' : label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-ink-mute min-h-[1rem]" role="status">
            {status || 'Tap once to save a check-in.'}
          </p>
        </div>
      </div>
    </section>
    <div className={`rounded-2xl px-5 py-3 flex items-center gap-3 text-sm ${insightTone}`} role="note">
      <Lightbulb className="h-5 w-5 shrink-0" aria-hidden />
      <p><span className="font-semibold">Today’s insight: </span>{insight.text}</p>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Mood overview */}
      <section className="card p-6 lg:col-span-4 order-1">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Mood overview</h3>
          <span className="text-xs text-ink-mute bg-surface-2 rounded-full px-2.5 py-1">Last 30 days</span>
        </div>
        {total === 0 ? (
          <p className="text-sm text-ink-mute mt-6 py-10 text-center">
            Log a check-in and your mood pattern will appear here.
          </p>
        ) : (
          <>
            {total >= 5 && (
              <div className="h-52 mt-2">
                <Radar
                  data={radarData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      r: {
                        beginAtZero: true,
                        ticks: { display: false, precision: 0 },
                        grid: { color: '#e8e4da' },
                        angleLines: { color: '#e8e4da' },
                        pointLabels: { font: { size: 11 }, color: '#72818b' },
                      },
                    },
                  }}
                />
              </div>
            )}
            {total < 5 && (
              <p className="text-xs text-ink-mute mt-3">
                {5 - total} more check-in{5 - total === 1 ? '' : 's'} unlocks the pattern chart.
              </p>
            )}
            <ul className="mt-4 space-y-2.5">
              {MOODS.map((m, i) => {
                const pct = Math.round((counts[i] / total) * 100);
                return (
                  <li key={m.key} className="text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-ink-soft flex-1">{m.label}</span>
                      <span className="text-ink font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-2 mt-1 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-slow" style={{ width: `${pct}%`, background: m.color }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      {/* Recommended */}
      <section className="card p-6 lg:col-span-4 order-2">
        <h3 className="font-display text-lg font-semibold text-ink">Recommended for you</h3>
        <p className="text-sm text-ink-mute mt-1">{lowNow ? 'Gentle steps for a heavier moment.' : 'Small things that help you stay steady.'}</p>
        <ul className="space-y-2.5 mt-4">
            {recommendations.map(({ text, to, Icon, tint }) => (
              <li key={text}>
                <a
                  href={to}
                  onClick={(e) => runAction(to, e, navigate)}
                  className="flex items-center gap-3 rounded-xl bg-surface border border-line px-3 py-2 text-sm text-ink-soft hover:border-lavender transition-colors"
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${tint}`}>
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  {text}
                </a>
              </li>
            ))}
        </ul>
      </section>

      {/* Support companion */}
      <section className="card p-6 lg:col-span-4 order-3 flex flex-col text-center">
        <h3 className="font-display text-lg font-semibold text-ink">Support companion</h3>
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-lavender to-mist text-white flex items-center justify-center mx-auto mt-5">
          <MessageCircleHeart className="h-7 w-7" aria-hidden />
        </div>
        <p className="mt-3 text-ink">How can I support you today?</p>
        <p className="text-sm text-ink-mute mt-1">Choose a prompt below or share what you need.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {PROMPTS.map((p) => (
            <button key={p} type="button" onClick={() => navigate('/dashboard/chat', { state: { prompt: p } })} className="prompt-pill">
              {p}
            </button>
          ))}
        </div>
        <form onSubmit={submitAsk} className="mt-auto pt-6">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface-2 pl-4 pr-1.5 py-1.5 focus-within:border-lavender">
            <input
              value={ask}
              onChange={(e) => setAsk(e.target.value)}
              placeholder="Ask me anything…"
              maxLength={2000}
              className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink-mute"
              aria-label="Ask the support companion"
            />
            <button type="submit" className="w-9 h-9 rounded-xl bg-lavender text-white flex items-center justify-center" aria-label="Open chat with this message">
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </section>

      {/* Journal */}
      <section className="card p-6 lg:col-span-4 order-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">My journal</h3>
          <span className="text-xs text-ink-mute">Private, this device only</span>
        </div>
        <textarea
          id="journal-box"
          value={journal}
          onChange={(e) => {
            setJournal(e.target.value);
            setJournalSaved(null);
          }}
          placeholder="What’s on your mind today?"
          rows={6}
          className="input mt-4 flex-1 resize-none bg-surface-2"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-ink-mute" role="status">{journalSaved}</span>
          <button type="button" onClick={saveJournal} className="btn-primary !py-1.5 !px-4 text-sm">
            Save
          </button>
        </div>
      </section>

      {/* Week */}
      <section className="card p-6 lg:col-span-4 order-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-lg font-semibold text-ink">Your week</h3>
            <p className="text-sm text-ink-mute mt-0.5">
              {logged === 0 ? 'No check-ins in the last 7 days.' : `${logged} of 7 days checked in.`}
            </p>
          </div>
          <a href="#mood" onClick={(e) => runAction('#mood', e, navigate)} className="icon-btn" aria-label="Go to the mood section">
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-5 flex items-end justify-between gap-2 h-36" aria-label="Average mood for each of the last 7 days">
          {week.map(({ day, average, count }) => (
            <div key={day.toISOString()} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div
                className={`w-full max-w-[2.25rem] rounded-xl transition-all duration-slow ${
                  average === null ? 'bg-surface-2' : 'bg-gradient-to-t from-lavender to-mist'
                }`}
                style={{ height: average === null ? '14%' : `${Math.round((average / 5) * 100)}%` }}
                title={average === null ? 'No check-in' : `${count} check-in${count === 1 ? '' : 's'}`}
              />
              <span className="text-xs text-ink-mute">{format(day, 'EEE')}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Today's checklist */}
      <section className="card p-6 lg:col-span-4 order-6 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-ink">Today</h3>
          <span className="text-xs font-semibold text-lavender-deep bg-lavender-soft rounded-full px-2.5 py-1">
            {doneCount} of {checklist.length}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-2 mt-4 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={checklist.length} aria-valuenow={doneCount} aria-label="Today's progress">
          <div className="h-full rounded-full bg-gradient-to-r from-lavender to-sage transition-all duration-slow" style={{ width: `${(doneCount / checklist.length) * 100}%` }} />
        </div>
        <ul className="mt-4 space-y-2">
          {checklist.map((item) => {
            const content = (
              <>
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-sage shrink-0" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5 text-ink-mute shrink-0" aria-hidden />
                )}
                <span className={item.done ? 'text-ink-mute line-through' : 'text-ink'}>{item.label}</span>
              </>
            );
            const cls = 'flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm';
            if (item.done || !item.to) return <li key={item.label} className={cls}>{content}</li>;
            return (
              <li key={item.label}>
                <a href={item.to} onClick={(e) => runAction(item.to as string, e, navigate)} className={`${cls} hover:border-lavender transition-colors`}>
                  {content}
                </a>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-ink-mute mt-auto pt-4">
          {doneCount === checklist.length ? 'All done for today. Be proud of that.' : 'Small steps count. Do what feels right.'}
        </p>
      </section>

      {/* Recent check-ins */}
      <section className="card p-6 lg:col-span-8 order-7">
        <h3 className="font-display text-lg font-semibold text-ink">Recent check-ins</h3>
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-mute mt-3">Nothing saved yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {sorted.slice(0, 4).map((e) => {
              const m = MOODS.find((x) => x.key === e.mood);
              return (
                <li key={e.id} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: m?.color || '#9a9fa9' }} />
                  <span className="text-ink font-medium">{m?.label || String(e.mood)}</span>
                  {e.note && <span className="text-ink-mute truncate flex-1">“{e.note}”</span>}
                  <span className="text-xs text-ink-mute ml-auto shrink-0">{formatDistanceToNow(new Date(e.date), { addSuffix: true })}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Help */}
      <button
        type="button"
        onClick={() => window.dispatchEvent(new CustomEvent('wellmind:open-help'))}
        className="resource-tile bg-gradient-to-br from-[#d9693f] to-[#f0a15a] lg:col-span-4 order-8 text-left flex flex-col justify-between min-h-[9rem]"
      >
        <HeartHandshake className="h-6 w-6" aria-hidden />
        <span>
          <span className="block font-semibold text-lg">Need help now?</span>
          <span className="block text-sm opacity-90 mt-1">Crisis lines for the US, UK and India</span>
        </span>
      </button>
    </div>
    </div>
  );
};

export default HomeOverview;
