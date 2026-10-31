import React, { useId } from 'react';

interface LogoMarkProps {
  size?: number;
  className?: string;
}

/** A soft heart (care) with a small sun (hope) on a calm teal-to-sky tile. */
export const LogoMark: React.FC<LogoMarkProps> = ({ size = 36, className }) => {
  // Unique per instance so a hidden copy can never break another copy's gradient.
  const gradId = `wm-logo-${useId().replace(/:/g, '')}`;
  return (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    className={className}
    role="img"
    aria-label="WellMind logo"
  >
    <defs>
      <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#3f9c93" />
        <stop offset="1" stopColor="#4f9bc4" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="12" fill={`url(#${gradId})`} />
    <path
      d="M20 31C10.5 24.5 8.8 17.2 13.2 13.6c3-2.4 5.9-1 6.8 1.6.9-2.6 3.8-4 6.8-1.6 4.4 3.6 2.7 10.9-6.8 17.4Z"
      fill="#fff"
    />
    <circle cx="29.5" cy="10.5" r="3" fill="#f0b441" />
  </svg>
  );
};

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
  wordmarkClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 34, showWordmark = true, className = '', wordmarkClassName = '' }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    {showWordmark && (
      <span className={`font-display font-semibold text-ink leading-none tracking-tight ${wordmarkClassName}`} style={{ fontSize: size * 0.58 }}>
        Well<span className="text-lavender-deep">Mind</span>
      </span>
    )}
  </span>
);

export default Logo;
