import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, MessageCircle, Heart, Leaf, LogOut, Phone, PhoneCall, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showGlobal, setShowGlobal] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Help and crisis support"
    >
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative card shadow-2xl rounded-3xl max-w-lg w-full p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-coral animate-pulse" />
              <p className="eyebrow text-coral font-bold tracking-wider">24/7 Immediate Help</p>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink mt-0.5">
              Crisis & Support Helplines
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-ink-mute hover:text-ink rounded-lg hover:bg-surface-2 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Crisp Crisis Notice */}
        <div className="mt-3 p-3 rounded-xl bg-coral-soft/70 border border-coral/20 text-xs text-ink space-y-1">
          <p className="font-semibold text-coral flex items-center gap-1.5">
            <Heart className="h-3.5 w-3.5 shrink-0" />
            You don't have to carry this alone.
          </p>
          <p className="text-ink-soft leading-relaxed">
            If you are in acute distress, experiencing a panic spiral, or thinking about self-harm, please reach out now. Free, confidential support is available 24/7.
          </p>
        </div>

        {/* India Helplines (Featured First) */}
        <div className="mt-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-ink px-1">
            <span className="flex items-center gap-1 text-teal-800 dark:text-teal-300">
              🇮🇳 India National Helplines (Toll-Free)
            </span>
            <span className="text-[10px] text-ink-mute font-normal">24 hours • 365 days</span>
          </div>

          {/* Tele-MANAS */}
          <div className="p-3.5 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/20 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-ink text-sm">Tele-MANAS</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-200">
                  Govt. of India
                </span>
              </div>
              <p className="text-xs text-ink-mute mt-0.5">
                Free psychological support by Ministry of Health & Family Welfare.
              </p>
              <p className="text-xs font-semibold text-teal-800 dark:text-teal-300 mt-1">
                Dial: 14416 or 1800-891-4416
              </p>
            </div>
            <a
              href="tel:14416"
              className="btn-primary !py-2 !px-3 text-xs shrink-0 flex items-center gap-1.5 !bg-teal-700 hover:!bg-teal-800 text-white"
            >
              <PhoneCall className="h-3.5 w-3.5" /> Call 14416
            </a>
          </div>

          {/* KIRAN Helpline */}
          <div className="p-3.5 rounded-2xl border border-line bg-surface flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-ink text-sm">KIRAN Helpline</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-ink-soft">
                  DEPwD
                </span>
              </div>
              <p className="text-xs text-ink-mute mt-0.5">
                24/7 National mental health rehabilitation helpline.
              </p>
              <p className="text-xs font-semibold text-ink mt-1">
                Dial: 1800-599-0019
              </p>
            </div>
            <a
              href="tel:18005990019"
              className="btn-ghost !py-2 !px-3 text-xs shrink-0 flex items-center gap-1.5 border border-line font-medium"
            >
              <Phone className="h-3.5 w-3.5" /> Call KIRAN
            </a>
          </div>

          {/* National Emergency */}
          <div className="p-3 rounded-xl border border-line/60 bg-surface-2/40 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-ink">Emergency & Medical Distress: </span>
              <span className="font-bold text-coral">Dial 112</span>
              <span className="text-ink-mute text-[11px] block mt-0.5">National All-in-One Emergency Services (India)</span>
            </div>
            <a
              href="tel:112"
              className="text-xs font-bold text-coral hover:underline shrink-0 px-2 py-1"
            >
              Dial 112 →
            </a>
          </div>
        </div>

        {/* Global / US / UK Section Toggle */}
        <div className="mt-4 pt-3 border-t border-line">
          <button
            type="button"
            onClick={() => setShowGlobal(!showGlobal)}
            className="text-xs text-ink-mute hover:text-ink font-medium inline-flex items-center gap-1.5 w-full justify-between"
          >
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Outside India? View US, UK & International lines
            </span>
            <span className="text-lavender font-semibold text-[11px]">
              {showGlobal ? 'Hide ▲' : 'Show ▼'}
            </span>
          </button>

          {showGlobal && (
            <div className="mt-2.5 space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-surface-2/60 border border-line flex justify-between items-center">
                <div>
                  <span className="font-semibold text-ink">United States: 988 Lifeline</span>
                  <p className="text-[11px] text-ink-mute">Call or text 988 (988lifeline.org)</p>
                </div>
                <a href="tel:988" className="btn-ghost !py-1 !px-2.5 text-[11px]">Call 988</a>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-2/60 border border-line flex justify-between items-center">
                <div>
                  <span className="font-semibold text-ink">United Kingdom: Samaritans</span>
                  <p className="text-[11px] text-ink-mute">Call 116 123 (samaritans.org)</p>
                </div>
                <a href="tel:116123" className="btn-ghost !py-1 !px-2.5 text-[11px]">Call 116 123</a>
              </div>
              <a
                href="https://www.iasp.info/suicidalthoughts/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-lavender hover:underline"
              >
                <span>International Association for Suicide Prevention (IASP) Directory</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {/* Quick App Navigation */}
        <div className="mt-4 pt-3 border-t border-line grid grid-cols-2 gap-2 text-xs">
          <Link
            to="/dashboard/chat"
            onClick={onClose}
            className="p-2.5 rounded-xl border border-line hover:border-lavender/50 bg-surface flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4 text-lavender shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-ink truncate">Talk to AI</p>
              <p className="text-[10px] text-ink-mute truncate">Grounded chat</p>
            </div>
          </Link>
          <Link
            to="/dashboard/wellness"
            onClick={onClose}
            className="p-2.5 rounded-xl border border-line hover:border-lavender/50 bg-surface flex items-center gap-2"
          >
            <Leaf className="h-4 w-4 text-teal-600 shrink-0" />
            <div className="truncate">
              <p className="font-semibold text-ink truncate">Wellness Tools</p>
              <p className="text-[10px] text-ink-mute truncate">Breathing & journal</p>
            </div>
          </Link>
        </div>

        {/* Sign out */}
        <div className="mt-4 pt-3 border-t border-line flex items-center justify-between text-xs">
          <p className="text-[11px] text-ink-mute">
            WellMind is a wellness companion, not medical care.
          </p>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn-ghost !py-1 !px-2.5 text-xs text-ink-mute hover:text-coral"
          >
            <LogOut className="h-3 w-3" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
