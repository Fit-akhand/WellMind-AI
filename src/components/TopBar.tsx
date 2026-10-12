import React, { useState } from 'react';
import { Menu, HelpCircle, Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onOpenMobileNav: () => void;
  onOpenHelp: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  onOpenMobileNav,
  onOpenHelp,
}) => {
  const [notifOpen, setNotifOpen] = useState(false);

  // Placeholder notifications: real notifications would come from a backend
  // endpoint. Until then, show an empty state rather than fabricating data.
  const hasNotifications = false;

  return (
    <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md border-b border-line">
      <div className="flex items-center gap-3 h-16 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 -ml-2 text-ink-soft hover:text-ink rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="font-display text-lg font-semibold text-ink truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-ink-mute truncate hidden sm:block">
              {subtitle}
            </p>
          )}
        </div>

        {/* Help (desktop) */}
        <button
          onClick={onOpenHelp}
          className="hidden sm:flex btn-ghost !py-2 !px-3 text-sm"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </button>

        {/* Notifications: honest empty state, no fabricated badges */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="p-2 text-ink-soft hover:text-ink rounded-lg hover:bg-surface-2 transition-colors duration-fast"
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="h-5 w-5" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 card shadow-lg rounded-xl p-4 z-50">
              <p className="text-sm font-medium text-ink">Notifications</p>
              {hasNotifications ? (
                <p className="text-sm text-ink-soft mt-1">
                  You have new updates.
                </p>
              ) : (
                <p className="text-sm text-ink-mute mt-1">
                  No new notifications.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
