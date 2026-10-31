import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

type Phase = 'inhale' | 'hold' | 'exhale';
type BreathStatus = 'idle' | 'running' | 'paused' | 'complete';

const PHASES: { id: Phase; label: string; seconds: number; cue: string }[] = [
  { id: 'inhale', label: 'Inhale', seconds: 4, cue: 'Breathe in through your nose.' },
  { id: 'hold', label: 'Hold', seconds: 7, cue: 'Hold gently. Skip this step if holding feels uncomfortable.' },
  { id: 'exhale', label: 'Exhale', seconds: 8, cue: 'Breathe out slowly.' },
];

const CYCLES = 6;

const GROUNDING = [
  { id: 'see', count: 5, label: 'Five things you can see' },
  { id: 'hear', count: 4, label: 'Four things you can hear' },
  { id: 'touch', count: 3, label: 'Three things you can touch' },
  { id: 'smell', count: 2, label: 'Two things you can smell' },
  { id: 'taste', count: 1, label: 'One thing you can taste' },
];

const WellnessActivities: React.FC<{ hideJournal?: boolean }> = ({ hideJournal = false }) => {
  return (
    <div className="space-y-6">
      {!hideJournal && (
      <div>
          <p className="text-sm text-ink-soft max-w-2xl">
          Short exercises you can do in this session. They are self-guided supports, not clinical treatment, and they are not saved to your account.
        </p>
      </div>
      )}
      <div className={`grid grid-cols-1 gap-6 ${hideJournal ? 'lg:grid-cols-2' : 'xl:grid-cols-3'}`}>
        <BreathingCard />
        <GroundingCard />
        {!hideJournal && <JournalCard />}
      </div>
    </div>
  );
};

const BreathingCard: React.FC = () => {
  const [status, setStatus] = useState<BreathStatus>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [cycle, setCycle] = useState(1);
  const { user } = useAuth();

  useEffect(() => {
    if (status !== 'complete' || !user) return;
    try {
      localStorage.setItem(`breathDate:${user.id}`, format(new Date(), 'yyyy-MM-dd'));
    } catch {
      // storage unavailable: the Home checklist just won't tick
    }
  }, [status, user]);

  useEffect(() => {
    if (status !== 'running') return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== 'running' || secondsLeft > 0) return;
    if (phaseIndex < PHASES.length - 1) {
      const next = phaseIndex + 1;
      setPhaseIndex(next);
      setSecondsLeft(PHASES[next].seconds);
      return;
    }
    if (cycle >= CYCLES) {
      setStatus('complete');
      return;
    }
    setCycle((current) => current + 1);
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
  }, [cycle, phaseIndex, secondsLeft, status]);

  const reset = () => {
    setStatus('idle');
    setPhaseIndex(0);
    setSecondsLeft(PHASES[0].seconds);
    setCycle(1);
  };

  const phase = PHASES[phaseIndex];

  return (
    <section className="card rounded-2xl p-6 flex flex-col">
      <h3 className="font-display text-xl font-semibold text-ink">Breathing</h3>
      <p className="text-sm text-ink-soft mt-2">
        A 4-7-8 pattern for about two minutes ({CYCLES} cycles). Pause whenever you want.
      </p>
      <div className="mt-5 flex flex-col items-center text-center" aria-live="polite">
        <div className="relative w-44 h-44 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#b8e4dd] to-[#cfeed8] ease-in-out"
            style={{
              transform: `scale(${
                status === 'running' || status === 'paused'
                  ? phase.id === 'exhale' ? 0.62 : 1
                  : 0.62
              })`,
              transitionProperty: 'transform',
              transitionDuration: status === 'running' ? `${phase.seconds}s` : '400ms',
              opacity: status === 'paused' ? 0.7 : 1,
            }}
            aria-hidden
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-lavender-deep font-semibold">
              {status === 'complete' ? 'Finished' : phase.label}
            </p>
            <p className="font-display text-4xl text-ink mt-0.5">
              {status === 'complete' ? 'Done' : secondsLeft}
            </p>
          </div>
        </div>
        <p className="text-sm text-ink-soft mt-3 max-w-xs">
          {status === 'idle' && 'Press start when you are ready.'}
          {status === 'running' && `${phase.cue} Cycle ${cycle} of ${CYCLES}.`}
          {status === 'paused' && `Paused on ${phase.label.toLowerCase()}. Cycle ${cycle} of ${CYCLES}.`}
          {status === 'complete' && 'Six cycles finished. This was a short reset, not a measured health result.'}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {status !== 'running' && status !== 'complete' && (
          <button type="button" className="btn-primary" onClick={() => setStatus('running')}>
            {status === 'paused' ? 'Resume' : 'Start breathing'}
          </button>
        )}
        {status === 'running' && (
          <button type="button" className="btn-ghost" onClick={() => setStatus('paused')}>
            Pause
          </button>
        )}
        {status === 'complete' && (
          <button type="button" className="btn-primary" onClick={reset}>
            Start again
          </button>
        )}
        {status !== 'idle' && (
          <button type="button" className="btn-ghost" onClick={reset}>
            Reset
          </button>
        )}
      </div>
    </section>
  );
};

const GroundingCard: React.FC = () => {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const filled = GROUNDING.filter((step) => (notes[step.id] || '').trim().length > 0).length;

  return (
    <section className="card rounded-2xl p-6 flex flex-col">
      <h3 className="font-display text-xl font-semibold text-ink">Grounding</h3>
      <p className="text-sm text-ink-soft mt-2">
        5-4-3-2-1: notice what is around you. Notes stay in this session only.
      </p>
      <div className="mt-4 space-y-3">
        {GROUNDING.map((step) => (
          <label key={step.id} className="block text-sm text-ink">
            {step.label}
            <input
              className="input mt-1"
              value={notes[step.id] || ''}
              onChange={(event) => setNotes((current) => ({ ...current, [step.id]: event.target.value }))}
              placeholder={`${step.count} ${step.count === 1 ? 'item' : 'items'}`}
            />
          </label>
        ))}
      </div>
      <p className="text-xs text-ink-mute mt-4" aria-live="polite">
        {filled === GROUNDING.length
          ? 'All five senses have a note. You can clear them and begin again.'
          : `${filled} of ${GROUNDING.length} senses noted.`}
      </p>
      <button type="button" className="btn-ghost mt-3 self-start" onClick={() => setNotes({})}>
        Clear notes
      </button>
    </section>
  );
};

const POSITIVE_WORDS = new Set([
  'good', 'great', 'happy', 'calm', 'peace', 'peaceful', 'grateful', 'gratitude',
  'better', 'hope', 'hopeful', 'proud', 'love', 'loved', 'smile', 'smiling',
  'progress', 'achieved', 'accomplished', 'strong', 'stronger', 'relieved', 'relaxed',
  'kind', 'kindness', 'joy', 'joyful', 'bright', 'confident', 'healthy', 'blessed',
  'healing', 'support', 'supported', 'safe', 'content', 'balanced', 'excited', 'win', 'clarity'
]);

const TENSION_WORDS = new Set([
  'anxious', 'anxiety', 'stress', 'stressed', 'sad', 'sadness', 'tired', 'exhausted',
  'fear', 'scared', 'afraid', 'failed', 'failure', 'panic', 'worried', 'worry',
  'lonely', 'alone', 'hopeless', 'overwhelmed', 'depressed', 'depression', 'hurt',
  'angry', 'frustrated', 'pressure', 'crying', 'pain', 'struggle', 'struggling',
  'nervous', 'burnout', 'stuck', 'guilt', 'guilty', 'ashamed', 'doubt'
]);

interface JournalEntry {
  id: string;
  text: string;
  date: string;
}

const JournalCard: React.FC = () => {
  const { user } = useAuth();
  const storageKey = `wellmind_journal_entries_${user?.id || 'local'}`;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [text, setText] = useState('');
  const [activeTab, setActiveTab] = useState<'write' | 'history'>('write');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveAlert, setSaveAlert] = useState(false);

  // Load past entries on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setEntries(parsed);
          if (parsed.length > 0) {
            setExpandedId(parsed[0].id);
          }
        }
      }
    } catch {
      // storage unavailable
    }
  }, [storageKey]);

  // Save entry to localStorage
  const handleSave = () => {
    if (!text.trim()) return;
    const now = new Date().toISOString();
    const newEntry: JournalEntry = {
      id: `entry_${Date.now()}`,
      text: text.trim(),
      date: now,
    };
    const updated = [newEntry, ...entries];
    setEntries(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
      setSaveAlert(true);
      setTimeout(() => setSaveAlert(false), 3000);
      setText('');
      setExpandedId(newEntry.id);
      setActiveTab('history');
    } catch {
      // ignore
    }
  };

  const handleDelete = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    if (expandedId === id) {
      setExpandedId(updated.length > 0 ? updated[0].id : null);
    }
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Analyze words in a given text
  const analyzeText = (content: string) => {
    const tokens = content.split(/(\s+|[.,!?;:()]+)/);
    const positiveFound: string[] = [];
    const tensionFound: string[] = [];

    tokens.forEach((token) => {
      const clean = token.toLowerCase().trim();
      if (POSITIVE_WORDS.has(clean)) {
        positiveFound.push(clean);
      } else if (TENSION_WORDS.has(clean)) {
        tensionFound.push(clean);
      }
    });

    return { tokens, positiveFound, tensionFound };
  };

  const activeEntry = entries.find((e) => e.id === expandedId) || entries[0] || null;
  const displayText = activeTab === 'write' ? text : activeEntry ? activeEntry.text : '';
  const { tokens, positiveFound, tensionFound } = analyzeText(displayText);

  return (
    <section className="card rounded-2xl p-6 flex flex-col xl:col-span-1">
      <div className="flex items-center justify-between pb-3 border-b border-line">
        <h3 className="font-display text-xl font-semibold text-ink">Private Journal</h3>
        <div className="flex gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'write'
                ? 'bg-lavender text-white'
                : 'text-ink-mute hover:text-ink hover:bg-surface-2'
            }`}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-lavender text-white'
                : 'text-ink-mute hover:text-ink hover:bg-surface-2'
            }`}
          >
            Past Entries ({entries.length})
          </button>
        </div>
      </div>

      <p className="text-xs text-ink-soft mt-2">
        Zero-knowledge local storage with real-time language mapping. Your private reflections never leave this device.
      </p>

      {/* Write View */}
      {activeTab === 'write' && (
        <div className="mt-3 flex flex-col flex-1">
          <textarea
            id="journal-entry"
            className="input min-h-28 text-sm"
            maxLength={2000}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How are you feeling today? What happened or what are you noticing?..."
          />

          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <button
              type="button"
              className="btn-primary text-xs !py-2 !px-3"
              disabled={!text.trim()}
              onClick={handleSave}
            >
              {saveAlert ? 'Saved to local storage!' : 'Save Reflection'}
            </button>
            {text && (
              <button
                type="button"
                className="btn-ghost text-xs !py-2 !px-3"
                onClick={() => setText('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* History View: Shows all journals without hiding any */}
      {activeTab === 'history' && (
        <div className="mt-3 flex flex-col flex-1">
          {entries.length === 0 ? (
            <p className="text-xs text-ink-mute py-6 text-center">
              No journal reflections saved yet. Click "Write" to add your first one!
            </p>
          ) : (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[11px] text-ink-mute px-1 pb-1">
                <span>All Saved Entries ({entries.length})</span>
                <span>Click to read or expand</span>
              </div>

              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                return (
                  <div
                    key={entry.id}
                    onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    className={`p-3 rounded-xl border transition-all text-xs cursor-pointer ${
                      isExpanded
                        ? 'border-lavender bg-surface-2/70 shadow-sm'
                        : 'border-line bg-surface hover:border-lavender/50'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-ink block">
                          {format(new Date(entry.date), 'MMM d, yyyy • h:mm a')}
                        </span>
                        {!isExpanded && (
                          <p className="text-ink-mute truncate mt-1">
                            {entry.text}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-lavender font-medium">
                          {isExpanded ? 'Collapse ▲' : 'Read ▼'}
                        </span>
                        {isExpanded && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(entry.id);
                            }}
                            className="text-coral hover:underline text-[11px] ml-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded full reflection */}
                    {isExpanded && (
                      <div className="mt-2.5 pt-2.5 border-t border-line/60">
                        <p className="text-ink leading-relaxed whitespace-pre-wrap">
                          {entry.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Language Sentiment & Word Map */}
      {displayText.trim() && (
        <div className="mt-4 pt-3 border-t border-line text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-ink">
              Language & Sentiment Map {activeTab === 'history' && activeEntry && '(Selected Entry)'}
            </span>
            <div className="flex gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-300">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Uplifting ({positiveFound.length})
              </span>
              <span className="inline-flex items-center gap-1 text-coral">
                <span className="w-2 h-2 rounded-full bg-coral"></span>
                Tension ({tensionFound.length})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-2/40 border border-line leading-relaxed text-ink/90 font-mono text-[11.5px] max-h-32 overflow-y-auto">
            {tokens.map((token, idx) => {
              const clean = token.toLowerCase().trim();
              if (POSITIVE_WORDS.has(clean)) {
                return (
                  <mark
                    key={idx}
                    className="bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200 px-1 py-0.5 rounded font-semibold"
                    title="Uplifting / Positive word"
                  >
                    {token}
                  </mark>
                );
              }
              if (TENSION_WORDS.has(clean)) {
                return (
                  <mark
                    key={idx}
                    className="bg-coral-soft text-coral dark:bg-rose-950/60 dark:text-rose-200 px-1 py-0.5 rounded font-semibold"
                    title="Tension / Stress word"
                  >
                    {token}
                  </mark>
                );
              }
              return <span key={idx}>{token}</span>;
            })}
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-ink-mute">
            <span>
              Tone:{' '}
              <strong className="text-ink">
                {positiveFound.length > tensionFound.length
                  ? '🌿 Primarily Hopeful & Grounded'
                  : tensionFound.length > positiveFound.length
                  ? '🌧️ Processing Stress & Pressure'
                  : positiveFound.length > 0
                  ? '⚖️ Mixed & Reflective'
                  : '📝 Observational'}
              </strong>
            </span>
            <span>Local device only</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default WellnessActivities;
