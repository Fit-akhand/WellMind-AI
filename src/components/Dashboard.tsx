import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AppShell from './AppShell';
import TopNav from './TopNav';
import HelpModal from './HelpModal';
import ChatInterface from './ChatInterface';
import MoodTracker from './MoodTracker';
import SurveyList from './SurveyList';
import HomeOverview from './HomeOverview';
import WellnessActivities from './WellnessActivities';
import ProgressSection from './ProgressSection';
import { useMood } from '../contexts/MoodContext';
import { useAuth } from '../contexts/AuthContext';
import { TITLE_BY_TAB, tabFromPath } from '../lib/routes';

const Dashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = tabFromPath(location.pathname);
  const isChat = activeTab === 'chat';
  const [helpOpen, setHelpOpen] = useState(false);
  const { user, logout } = useAuth();
  const { loadError } = useMood();
  const headings = TITLE_BY_TAB[activeTab];
  const chatPrompt = (location.state as { prompt?: string } | null)?.prompt;

  useEffect(() => {
    const open = () => setHelpOpen(true);
    window.addEventListener('wellmind:open-help', open);
    return () => window.removeEventListener('wellmind:open-help', open);
  }, []);

  return (
    <AppShell>
      <div className={isChat ? 'h-screen flex flex-col overflow-hidden' : 'min-h-screen flex flex-col'}>
        <TopNav onOpenHelp={() => setHelpOpen(true)} />
        <main
          className={
            isChat
              ? 'flex-1 min-h-0 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-3 pb-3 sm:pb-5'
              : 'flex-1 w-full max-w-[1280px] mx-auto px-3 sm:px-6 py-6'
          }
        >
          {activeTab !== 'home' && activeTab !== 'mood' && !isChat && (
            <div className="mb-6">
              <h1 className="font-display text-3xl font-semibold text-ink">{headings.title}</h1>
              <p className="text-ink-mute mt-1">{headings.subtitle}</p>
            </div>
          )}

          {activeTab === 'home' && (
            <div className="space-y-8">
              {loadError && (
                <p className="text-sm text-coral bg-coral-soft rounded-xl px-4 py-3" role="status">
                  {loadError}
                </p>
              )}
              <HomeOverview />
              <SurveyList />
            </div>
          )}

          {isChat && <ChatInterface prefill={chatPrompt ? { text: chatPrompt, n: 1 } : undefined} />}
          {activeTab === 'mood' && <MoodTracker />}

          {activeTab === 'wellness' && (
            <div className="space-y-8">
              <WellnessActivities />
              <SurveyList />
            </div>
          )}

          {activeTab === 'progress' && <ProgressSection />}

          {activeTab === 'settings' && (
            <section className="card p-6 sm:p-8 space-y-6 max-w-3xl">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-surface border border-line">
                  <dt className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Name</dt>
                  <dd className="text-ink mt-1">{user?.name || 'Unavailable'}</dd>
                </div>
                <div className="p-5 rounded-2xl bg-surface border border-line">
                  <dt className="text-xs uppercase tracking-wide text-ink-mute font-semibold">Email</dt>
                  <dd className="text-ink mt-1 break-all">{user?.email || 'Unavailable'}</dd>
                </div>
              </dl>
              <div className="p-5 rounded-2xl bg-surface border border-line text-sm text-ink-soft space-y-2">
                <p>Mood check-ins, screening answers, and chat messages are stored with your account on the server.</p>
                <p>Journal notes and grounding notes stay in this browser and are not uploaded.</p>
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
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </AppShell>
  );
};

export default Dashboard;
