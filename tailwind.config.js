/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-2': 'var(--color-surface-2)',
        ink: 'var(--color-ink)',
        'ink-soft': 'var(--color-ink-soft)',
        'ink-mute': 'var(--color-ink-mute)',
        lavender: {
          DEFAULT: 'var(--color-lavender)',
          deep: 'var(--color-lavender-deep)',
          soft: 'var(--color-lavender-soft)',
        },
        sage: {
          DEFAULT: 'var(--color-sage)',
          soft: 'var(--color-sage-soft)',
        },
        mist: {
          DEFAULT: 'var(--color-mist)',
          soft: 'var(--color-mist-soft)',
        },
        coral: {
          DEFAULT: 'var(--color-coral)',
          soft: 'var(--color-coral-soft)',
        },
        line: 'var(--color-line)',
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
      transitionDuration: {
        fast: 'var(--t-fast)',
        base: 'var(--t-base)',
        slow: 'var(--t-slow)',
      },
    },
  },
  plugins: [],
};
