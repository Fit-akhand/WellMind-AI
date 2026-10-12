import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Shield,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const LandingPage: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const openLogin = () => {
    setShowLogin(true);
    setShowSignup(false);
  };

  const openSignup = () => {
    setShowSignup(true);
    setShowLogin(false);
  };

  const closeModals = () => {
    setShowLogin(false);
    setShowSignup(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-line bg-surface/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-lavender to-sage flex items-center justify-center text-white shadow-sm">
              <Heart className="h-4.5 w-4.5" fill="currentColor" />
            </div>
            <span className="font-display font-semibold text-lg text-ink">
              WellMind AI
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openLogin}
              className="btn-ghost !py-2 !px-4 text-xs font-semibold"
            >
              Sign in
            </button>
            <button
              onClick={openSignup}
              className="btn-primary !py-2 !px-4 text-xs font-semibold"
            >
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lavender-soft text-lavender-deep text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            AI-powered mental wellness support
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-semibold text-ink tracking-tight leading-[1.15]">
            A calm, supportive space for your mental wellbeing.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-ink-soft max-w-2xl mx-auto leading-relaxed">
            WellMind AI pairs compassionate conversations with evidence-based
            counseling insights, daily mood tracking, and clinical screenings —
            designed to help you navigate everyday stress, anxiety, and low mood.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={openSignup}
              className="btn-primary !py-3 !px-6 text-sm w-full sm:w-auto shadow-md"
            >
              <span>Begin your check-in</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={openLogin}
              className="btn-ghost !py-3 !px-6 text-sm w-full sm:w-auto"
            >
              I already have an account
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-mute">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-sage" /> Private & local-first
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-sage" /> 1,470+ counselor insights
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-sage" /> Non-diagnostic & safe
            </span>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-16 bg-surface border-y border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="eyebrow">How it works</p>
            <h2 className="font-display text-3xl font-semibold text-ink mt-1">
              Thoughtfully built for gentle daily habits
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card rounded-2xl p-6 sm:p-8 card-hover">
              <div className="w-12 h-12 rounded-xl bg-lavender-soft text-lavender-deep flex items-center justify-center mb-5">
                <MessageCircle className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink">
                AI Companion
              </h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                Empathetic, non-judgmental chat grounded in real counseling
                transcripts. Ideal for late-night overthinking or mid-day resets.
              </p>
            </div>

            <div className="card rounded-2xl p-6 sm:p-8 card-hover">
              <div className="w-12 h-12 rounded-xl bg-sage-soft text-sage flex items-center justify-center mb-5">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink">
                Mood Patterns
              </h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                Log your feelings in seconds. See gentle 7-day trendlines, mood
                breakdowns, and personal reflections without clinical clutter.
              </p>
            </div>

            <div className="card rounded-2xl p-6 sm:p-8 card-hover">
              <div className="w-12 h-12 rounded-xl bg-mist-soft text-mist flex items-center justify-center mb-5">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold text-ink">
                Standardized Screenings
              </h3>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                Self-administer PHQ-9 and GAD-7 questionnaires. Answers are saved to your account and are informational, not a diagnosis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 border-t border-line bg-surface-2 text-xs text-ink-mute">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 WellMind AI. All rights reserved.</p>
          <p className="text-center sm:text-right max-w-md">
            WellMind AI is an informational self-help tool, not a substitute for
            licensed psychotherapy or emergency medical services.
          </p>
        </div>
      </footer>

      {/* Modal Overlay */}
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
            >
              <button
                onClick={closeModals}
                className="absolute top-4 right-4 text-ink-mute hover:text-ink z-10 p-1"
                aria-label="Close dialog"
              >
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
