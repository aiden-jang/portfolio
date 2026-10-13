import { useEffect } from 'react';
import { useAppStore } from '../store';

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// Owns the body[data-theme] sync, so CSS-only consumers stay in step whichever control flips it.
export function ThemeToggle() {
  const themeName = useAppStore((s) => s.themeName);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isNight = themeName === 'night';

  useEffect(() => {
    document.body.dataset.theme = themeName;
  }, [themeName]);

  return (
    <button
      type="button"
      aria-label={`Lighting: ${isNight ? 'Night' : 'Dusk'}. Switch to ${isNight ? 'Dusk' : 'Night'}`}
      aria-pressed={isNight}
      title={`Lighting: ${isNight ? 'Night' : 'Dusk'}`}
      onClick={toggleTheme}
      className="
        inline-flex items-center justify-center gap-2 px-2 h-8 rounded-full cursor-pointer
        transition-transform duration-200 hover:scale-110
      "
    >
      {isNight ? <MoonIcon /> : <SunIcon />}
      <span className="control-group-label">{isNight ? 'Night' : 'Dusk'}</span>
    </button>
  );
}

export function MobileThemeButton() {
  const themeName = useAppStore((s) => s.themeName);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isNight = themeName === 'night';

  return (
    <button
      type="button"
      aria-label={`Lighting: ${isNight ? 'Night' : 'Dusk'}. Switch to ${isNight ? 'Dusk' : 'Night'}`}
      aria-pressed={isNight}
      title={`Lighting: ${isNight ? 'Night' : 'Dusk'}`}
      onClick={toggleTheme}
      className="
        pointer-events-auto inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full cursor-pointer
        bg-white/[0.04] border border-[var(--color-line)]
        transition-colors active:border-[var(--color-neon)]
      "
    >
      <span className="mobile-light-name">{isNight ? 'Night' : 'Dusk'}</span>
      {isNight ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
