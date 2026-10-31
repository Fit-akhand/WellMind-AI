import React, { useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Lock,
  Menu,
  MessageCircleHeart,
  PenLine,
  ShieldCheck,
  Sparkles,
  Wind,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import Logo from './Logo';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how', label: 'How it works' },
  { href: '#safety', label: 'Safety' },
];

const FEATURES = [
  {
    title: 'A companion that listens',
    body: 'Chat at your own pace. Replies are warm, short and practical, and they remember what you said earlier in the conversation.',
    Icon: MessageCircleHeart,
    tint: 'bg-lavender-soft text-lavender-deep',
    wide: true,
  },
  {
    title: 'Mood in one tap',
    body: 'Check in in three seconds and watch a gentle 7-day and 30-day picture build up.',
    Icon: BarChart3,
    tint: 'bg-sage-soft text-sage',
  },
  {
    title: 'Breathing and grounding',
    body: 'A guided 4-7-8 breathing circle and a 5-4-3-2-1 grounding exercise for when things feel like too much.',
    Icon: Wind,
    tint: 'bg-mist-soft text-mist',
  },
  {
    title: 'A private journal',
    body: 'Write freely. Journal notes stay on your device.',
    Icon: PenLine,
    tint: 'bg-sun-soft text-[#9a6a00]',
  },
  {
    title: 'Standard screenings',
    body: 'PHQ-9 and GAD-7 questionnaires to help you notice patterns. Informational, never a diagnosis.',
    Icon: ClipboardList,
    tint: 'bg-coral-soft text-coral',
    wide: true,
  },
];

const STEPS = [
  { n: '1', title: 'Check in', body: 'Tell WellMind how you feel with a single tap.' },
  { n: '2', title: 'Get support', body: 'Talk it through, breathe, or write it down. Suggestions adapt to your mood.' },
  { n: '3', title: 'Notice patterns', body: 'See your week, your streak and a daily insight, built only from what you saved.' },
];

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
    setMenuOpen(false);
  };
  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
    setMenuOpen(false);
  };
  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-30 px-3 sm:px-6 pt-3">
        <div className="mx-auto max-w-6xl rounded-full bg-surface/90 backdrop-blur border border-line shadow-sm px-3 sm:px-4 py-2 flex items-center gap-3">
          <a href="#top" className="pl-1 pr-2" aria-label="WellMind home">
            <Logo size={34} />
          </a>
          <nav className="hidden md:flex flex-1 justify-center gap-1" aria-label="Sections">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-pill">
                {link.label}
              </a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:inline-flex">
              <button onClick={openLogin} className="btn-ghost !py-2 !px-4 text-sm whitespace-nowrap">
                Sign in
              </button>
            </span>
            <button onClick={openSignup} className="btn-primary !py-2 !px-4 text-sm whitespace-nowrap">
              Get started
            </button>
            <button
              type="button"
              className="icon-btn md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden mx-auto max-w-6xl mt-2 card p-2 shadow-lg">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="menu-item">
                {link.label}
              </a>
            ))}
            <button onClick={openLogin} className="menu-item w-full">
              Sign in
            </button>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero-gradient border-0 relative overflow-hidden mt-3">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 border border-line text-lavender-deep text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Calm support, any time
              </p>
              <h1 className="font-display text-4xl sm:text-6xl font-semibold tracking-tight leading-[1.1]">
                Feeling nervous? <span className="text-lavender-deep">Breathe.</span> We’re here.
              </h1>
              <p className="mt-6 text-lg text-ink-soft max-w-xl leading-relaxed">
                WellMind is a gentle space to check in with your mood, talk things through, and build small daily habits
                that help you feel steadier.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row flex-wrap gap-3">
                <button onClick={openSignup} className="btn-primary !py-3 !px-6 shadow-md whitespace-nowrap">
                  Begin your check-in <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
                <button onClick={openLogin} className="btn-ghost !py-3 !px-6 bg-surface/70 whitespace-nowrap">
                  I already have an account
                </button>
              </div>
              <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-mute">
                <li className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-sage" aria-hidden /> Private to your account</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-sage" aria-hidden /> Grounded in 1,400+ counseling answers</li>
                <li className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-sage" aria-hidden /> Non-diagnostic</li>
              </ul>
            </motion.div>

            {/* Example conversation */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
              aria-label="Example conversation"
            >
              <div className="card !rounded-3xl shadow-lg overflow-hidden">
                <div className="px-5 py-3.5 border-b border-line flex items-center gap-3 bg-surface">
                  <Logo size={30} showWordmark={false} />
                  <div>
                    <p className="font-display font-semibold leading-tight">WellMind Companion</p>
                    <p className="text-xs text-ink-mute flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-sage" aria-hidden /> Here to listen, at your pace
                    </p>
                  </div>
                </div>
                <div className="chat-surface p-5 space-y-4">
                  <div className="flex justify-end">
                    <div className="bubble-user px-4 py-2.5 text-[15px] shadow-sm">I’m really nervous about tomorrow.</div>
                  </div>
                  <div className="bubble-bot px-4 py-3 text-[15px] shadow-sm max-w-[90%] space-y-2.5">
                    <p>That makes sense, and the nerves can ease. Here are a few things to try:</p>
                    <ul className="space-y-1.5 text-ink-soft">
                      {['Breathe in for 4, out for 6, three times', 'Write down one thing you can control', 'Picture the first calm minute'].map((t) => (
                        <li key={t} className="flex gap-2">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-lavender shrink-0" aria-hidden />
                          {t}
                        </li>
                      ))}
                    </ul>
                    <p>What feels hardest right now?</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Guide me step by step', 'Give me another idea'].map((t) => (
                      <span key={t} className="prompt-pill !bg-surface">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex absolute -top-5 -right-3 card shadow-lg px-4 py-3 items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-sage-soft text-sage flex items-center justify-center">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-sm"><span className="font-semibold">Check-in streaks</span><br /><span className="text-ink-mute text-xs">Small steps add up</span></p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">Features</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Everything you need, nothing that overwhelms</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.map(({ title, body, Icon, tint, wide }) => (
              <div key={title} className={`card p-6 sm:p-7 card-hover ${wide ? 'md:col-span-2' : ''}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${tint}`}>
                  <Icon className="h-6 w-6" aria-hidden />
                </div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="text-ink-soft mt-2 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="bg-surface border-y border-line">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <p className="eyebrow">How it works</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-2">Three gentle steps</h2>
            </div>
            <ol className="grid md:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <li key={step.n} className="relative rounded-3xl bg-surface-2 border border-line p-7">
                  <span className="w-10 h-10 rounded-full bg-gradient-to-br from-lavender to-mist text-white font-semibold flex items-center justify-center mb-4">
                    {step.n}
                  </span>
                  <h3 className="font-display text-xl font-semibold">{step.title}</h3>
                  <p className="text-ink-soft mt-2 leading-relaxed">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Safety */}
        <section id="safety" className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <div className="rounded-[2rem] bg-gradient-to-br from-[#d9693f] to-[#f0a15a] text-white p-8 sm:p-12 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <HeartHandshake className="h-8 w-8 mb-4" aria-hidden />
              <h2 className="font-display text-3xl font-semibold">If you are in crisis, please reach out now</h2>
              <p className="mt-3 text-white/90 leading-relaxed">
                WellMind is a self-help tool. It is not therapy, a diagnosis, or an emergency service. It recognises
                words that suggest crisis and shows these lines first.
              </p>
            </div>
            <ul className="space-y-3 text-sm bg-white/15 rounded-2xl p-5 backdrop-blur">
              <li><span className="font-semibold">United States:</span> call or text 988</li>
              <li><span className="font-semibold">United Kingdom and Ireland:</span> Samaritans, 116 123</li>
              <li><span className="font-semibold">India:</span> Tele-MANAS, 14416 or 1-800-891-4416</li>
              <li className="text-white/90">Immediate danger: contact local emergency services.</li>
            </ul>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 text-center">
          <Logo size={52} showWordmark={false} className="mx-auto" />
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-6">Take one small step today</h2>
          <p className="text-ink-soft mt-3">It takes three seconds to check in. Free to start.</p>
          <button onClick={openSignup} className="btn-primary !py-3 !px-7 mt-8 shadow-md">
            Create your account <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </section>
      </main>

      <footer className="mt-auto py-10 border-t border-line bg-surface-2 text-xs text-ink-mute">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size={28} />
          <p className="text-center sm:text-right max-w-md">
            © 2026 WellMind. An informational self-help tool, not a substitute for licensed psychotherapy or emergency services.
          </p>
        </div>
      </footer>

      {/* Sign in / sign up dialog */}
      <AnimatePresence>
        {(showLogin || showSignup) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              <button onClick={closeModals} className="absolute top-4 right-4 text-ink-mute hover:text-ink z-10 p-1" aria-label="Close dialog">
                <X className="h-5 w-5" />
              </button>
              {showLogin && (
                <LoginForm
                  onSuccess={closeModals}
                  onSwitchToSignup={() => {
                    setShowLogin(false);
                    setShowSignup(true);
                  }}
                />
              )}
              {showSignup && (
                <SignupForm
                  onBackToLogin={() => {
                    setShowSignup(false);
                    setShowLogin(true);
                  }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;
