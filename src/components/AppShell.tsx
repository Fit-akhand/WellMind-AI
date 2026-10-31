import React from 'react';
interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bg text-ink font-sans antialiased selection:bg-lavender-soft selection:text-ink-soft">
      {/* Subtle background texture for wellness feel */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.35] z-0" aria-hidden>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="bg-grad" cx="30%" cy="30%" r="70%">
              <stop offset="0%" style={{ stopColor: "var(--color-lavender-soft)" }} stopOpacity="0.8" />
              <stop offset="100%" style={{ stopColor: "var(--color-bg)" }} stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grad)" />
        </svg>
      </div>

      <main className="relative z-10 min-h-screen">{children}</main>
    </div>
  );
};

export default AppShell;
