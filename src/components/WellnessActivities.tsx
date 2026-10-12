import React, { useEffect, useState } from 'react';

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

const WellnessActivities: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Practices</p>
        <h2 className="font-display text-2xl font-semibold text-ink mt-1">Wellness</h2>
        <p className="text-sm text-ink-soft mt-2 max-w-2xl">
          Short exercises you can do in this session. They are self-guided supports, not clinical treatment, and they are not saved to your account.
        </p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <BreathingCard />
        <GroundingCard />
        <JournalCard />
      </div>
    </div>
  );
};

const BreathingCard: React.FC = () => {
  const [status, setStatus] = useState<BreathStatus>('idle');
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(PHASES[0].seconds);
  const [cycle, setCycle] = useState(1);

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
      <div className="mt-5 rounded-xl bg-sage-soft/70 px-4 py-5 text-center" aria-live="polite">
        <p className="text-xs uppercase tracking-wide text-sage font-semibold">
          {status === 'complete' ? 'Finished' : phase.label}
        </p>
        <p className="font-display text-4xl text-ink mt-1">
          {status === 'complete' ? 'Done' : secondsLeft}
        </p>
        <p className="text-sm text-ink-soft mt-2">
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

const JournalCard: React.FC = () => {
  const [text, setText] = useState('');
  const [savedLocally, setSavedLocally] = useState(false);

  return (
    <section className="card rounded-2xl p-6 flex flex-col">
      <h3 className="font-display text-xl font-semibold text-ink">Journaling</h3>
      <p className="text-sm text-ink-soft mt-2">
        One small moment from today is enough. This reflection is kept only in this open page and is not stored on the server.
      </p>
      <label className="mt-4 text-sm text-ink" htmlFor="journal-entry">
        Reflection
        <textarea
          id="journal-entry"
          className="input mt-1 min-h-32"
          maxLength={2000}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setSavedLocally(false);
          }}
          placeholder="What is one thing you noticed today?"
        />
      </label>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          className="btn-primary"
          disabled={!text.trim()}
          onClick={() => setSavedLocally(true)}
        >
          Keep on this page
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            setText('');
            setSavedLocally(false);
          }}
        >
          Clear
        </button>
      </div>
      <p className="text-xs text-ink-mute mt-3" aria-live="polite">
        {savedLocally
          ? 'Kept in this browser tab until you leave or clear it. It was not uploaded.'
          : `${text.length}/2000 characters. Nothing is uploaded from this box.`}
      </p>
    </section>
  );
};

export default WellnessActivities;
