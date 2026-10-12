import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, MessageCircle, Heart, Leaf, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CRISIS_GUIDANCE, SUPPORT_LIMITATION } from '../lib/supportCopy';

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ open, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const resources = [
    {
      icon: MessageCircle,
      title: 'Talk to WellMind AI',
      desc: 'Start a supportive conversation in AI Chat.',
      to: '/dashboard/chat',
    },
    {
      icon: Heart,
      title: '988 Suicide & Crisis Lifeline',
      desc: 'US only: call or text 988. If you are elsewhere, use a local service. See the note below.',
      to: undefined,
      external: 'https://988lifeline.org',
    },
    {
      icon: Leaf,
      title: 'Wellness activities',
      desc: 'Breathing, grounding, and journaling exercises.',
      to: '/dashboard/wellness',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Help and support"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative card shadow-xl rounded-2xl max-w-lg w-full p-6 sm:p-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Help & support</p>
            <h2 className="font-display text-2xl font-semibold text-ink mt-1">
              How can we help?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ink-mute hover:text-ink rounded-lg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-ink-soft mt-3">
          {SUPPORT_LIMITATION} {CRISIS_GUIDANCE}
        </p>

        <div className="mt-5 space-y-3">
          {resources.map(({ icon: Icon, title, desc, to, external }) =>
            external ? (
              <a
                key={title}
                href={external}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-xl border border-line hover:bg-surface-2 transition-colors duration-fast"
              >
                <div className="w-9 h-9 rounded-lg bg-coral-soft text-coral flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs text-ink-mute">{desc}</p>
                </div>
              </a>
            ) : (
              <Link
                key={title}
                to={to!}
                onClick={onClose}
                className="flex items-start gap-3 p-3 rounded-xl border border-line hover:bg-surface-2 transition-colors duration-fast"
              >
                <div className="w-9 h-9 rounded-lg bg-lavender-soft text-lavender-deep flex items-center justify-center shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">{title}</p>
                  <p className="text-xs text-ink-mute">{desc}</p>
                </div>
              </Link>
            )
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
          <p className="text-xs text-ink-mute">
            Emergency numbers depend on where you are. 911 is the US number.
          </p>
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="btn-ghost !py-1.5 !px-3 text-xs"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
