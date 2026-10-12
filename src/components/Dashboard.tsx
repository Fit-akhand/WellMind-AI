import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Leaf, Sparkles } from 'lucide-react';
import AppShell from './AppShell';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import HelpModal from './HelpModal';
import ChatInterface from './ChatInterface';
import MoodTracker from './MoodTracker';
import SurveyList from './SurveyList';
import WellnessActivities from './WellnessActivities';
import { useMood } from '../contexts/MoodContext';
import { useSurvey } from '../contexts/SurveyContext';
import { useAuth } from '../contexts/AuthContext';
import { TITLE_BY_TAB, tabFromPath } from '../lib/routes';
import { entriesInLocalWindow } from '../lib/moodStats';
import { SUPPORT_LIMITATION } from '../lib/supportCopy';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const activeTab = tabFromPath(location.pathname);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [referenceDocs, setReferenceDocs] = useState<number | null | 'unavailable'>('unavailable');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { moodEntries, getMoodStats, loadError } = useMood();
  const { surveyResults } = useSurvey();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let cancelled = false;
    fetch('/health')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && typeof data.documents === 'number') setReferenceDocs(data.documents);
        else if (data && data.documents === null) setReferenceDocs('unavailable');
        else setReferenceDocs('unavailable');
      })
      .catch(() => {
        if (!cancelled) setReferenceDocs('unavailable');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = getMoodStats();
  const latestMood = [...moodEntries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0];
  const weekEntries = entriesInLocalWindow(moodEntries, 7);
  const monthEntries = entriesInLocalWindow(moodEntries, 30);
  const weekSurveys = entriesInLocalWindow(
    surveyResults.map((result) => ({ ...result, date: result.date })),
    7
  );
  const headings = TITLE_BY_TAB[activeTab];

  return (
    <AppShell>
      <div className="flex h-screen overflow-hidden bg-bg">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((value) => !value)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onOpenHelp={() => setHelpOpen(true)}
        />

        <div
          className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-[padding] duration-slow ${
            sidebarCollapsed ? 'lg:pl-[72px]' : 'lg:pl-64'
          }`}
        >
          <TopBar
            title={headings.title}
            subtitle={
              activeTab === 'mood'
                ? `Trend from your last saved entries: ${stats.recentTrend}`
                : headings.subtitle
            }
            onOpenMobileNav={() => setMobileOpen(true)}
            onOpenHelp={() => setHelpOpen(true)}
          />

          <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'home' && (
              <div className="space-y-8">
                <section className="card shadow-md rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                  <h2 className="font-display text-3xl sm:text-4xl font-semibold text-ink tracking-tight">
                    {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
                  </h2>
                  <p className="mt-3 text-ink-soft max-w-xl">
                    Your dashboard shows saved mood entries and screenings. It does not invent streaks or scores.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    <NavLink to="/dashboard/chat" className="btn-primary">
                      Open AI chat <ArrowUpRight className="h-4 w-4" />
                    </NavLink>
                    <NavLink to="/dashboard/mood" className="btn-ghost">
                      Track your mood
                    </NavLink>
                  </div>
                </section>

                {loadError && (
                  <p className="text-sm text-coral bg-coral-soft rounded-xl px-4 py-3" role="status">
                    {loadError}
                  </p>
                )}

                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Stat label="Saved moods" value={String(moodEntries.length)} hint="All records in your account" />
                  <Stat label="Last 7 days" value={String(weekEntries.length)} hint="Local calendar days" />
                  <Stat label="Latest mood" value={latestMood ? String(latestMood.mood) : 'None yet'} hint={latestMood ? 'Most recent saved entry' : 'No mood has been saved'} />
                  <Stat
                    label="Reference library"
                    value={referenceDocs === 'unavailable' ? 'Unavailable' : String(referenceDocs)}
                    hint={referenceDocs === 'unavailable' ? 'The service health check did not return a count' : 'Counseling references available to retrieval'}
                  />
                </section>

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Breathing', desc: 'A timed 4-7-8 reset', to: '/dashboard/wellness' },
                    { title: 'Grounding', desc: '5-4-3-2-1 notes for this session', to: '/dashboard/wellness' },
                    { title: 'Screenings', desc: 'PHQ-9 and GAD-7 questionnaires', to: '/dashboard/wellness' },
                  ].map((item) => (
                    <NavLink key={item.title} to={item.to} className="card rounded-xl p-4 card-hover">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                        <Leaf className="h-4 w-4 text-sage" />
                      </div>
                      <p className="text-xs text-ink-mute mt-2">{item.desc}</p>
                    </NavLink>
                  ))}
                </section>

                <SurveyList />
              </div>
            )}

            {activeTab === 'chat' && <ChatInterface />}
            {activeTab === 'mood' && <MoodTracker />}
            {activeTab === 'wellness' && (
              <div className="space-y-8">
                <WellnessActivities />
                <SurveyList />
              </div>
            )}

            {activeTab === 'progress' && (
              <section className="card rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-mist-soft text-mist flex items-center justify-center">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-semibold text-ink">Your progress</h2>
                    <p className="text-sm text-ink-mute">Counts use your device’s local calendar and only include saved records.</p>
                  </div>
                </div>
                {loadError && (
                  <p className="text-sm text-coral bg-coral-soft rounded-xl px-4 py-3" role="status">{loadError}</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Stat label="Moods, last 7 days" value={String(weekEntries.length)} hint={weekEntries.length === 0 ? 'No entries in this window' : 'Saved mood check-ins'} />
                  <Stat label="Moods, last 30 days" value={String(monthEntries.length)} hint="Includes today" />
                  <Stat label="Screenings, last 7 days" value={String(weekSurveys.length)} hint={`${surveyResults.length} saved in total`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-surface border border-line">
                    <p className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Recent mood trend</p>
                    <p className="font-display text-3xl text-ink mt-1 capitalize">{moodEntries.length < 2 ? 'Not enough data' : stats.recentTrend}</p>
                    <p className="text-xs text-ink-mute mt-1">
                      {moodEntries.length < 2
                        ? 'At least two saved moods are needed before a trend is calculated.'
                        : 'Compares the newer half of your last 7 saved entries with the older half.'}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl bg-surface border border-line">
                    <p className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Wellness exercises</p>
                    <p className="font-display text-3xl text-ink mt-1">Not recorded</p>
                    <p className="text-xs text-ink-mute mt-1">Breathing, grounding, and journaling stay in the session and are not counted here.</p>
                  </div>
                </div>
                <p className="text-sm text-ink-soft leading-relaxed">{SUPPORT_LIMITATION}</p>
              </section>
            )}

            {activeTab === 'settings' && (
              <section className="card rounded-2xl p-6 sm:p-8 space-y-6 max-w-3xl">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-ink">Settings</h2>
                  <p className="text-sm text-ink-mute mt-1">Account details from your signed-in session.</p>
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 rounded-xl bg-surface border border-line">
                    <dt className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Name</dt>
                    <dd className="text-ink mt-1">{user?.name || 'Unavailable'}</dd>
                  </div>
                  <div className="p-5 rounded-xl bg-surface border border-line">
                    <dt className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Email</dt>
                    <dd className="text-ink mt-1 break-all">{user?.email || 'Unavailable'}</dd>
                  </div>
                </dl>
                <div className="p-5 rounded-xl bg-surface border border-line text-sm text-ink-soft space-y-2">
                  <p>Mood check-ins, screening answers, and chat messages are stored with your account on the server.</p>
                  <p>Journaling and grounding notes on the Wellness page stay in the browser tab and are not uploaded.</p>
                  <p>Signing out removes the session token from this browser. It does not delete saved records.</p>
                </div>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Sign out
                </button>
              </section>
            )}
          </main>
        </div>
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </AppShell>
  );
};

const Stat: React.FC<{ label: string; value: string; hint: string }> = ({ label, value, hint }) => (
  <div className="card rounded-xl p-5">
    <p className="text-xs uppercase tracking-wide text-ink-mute font-semibold">{label}</p>
    <p className="font-display text-2xl font-semibold text-ink mt-1 capitalize break-words">{value}</p>
    <p className="text-xs text-ink-mute mt-1">{hint}</p>
  </div>
);

export default Dashboard;
