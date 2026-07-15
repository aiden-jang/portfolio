import { useEffect, useRef } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';
import { useAppStore } from '../store';

/** Compact 44px background (day/night) toggle for the mobile bottom bar. Desktop
 *  keeps the `B` key + the ThemeToggle in the nav; the body[data-theme] sync
 *  lives on that always-mounted instance, so this just flips the store. */
export function MobileThemeButton() {
  const themeName = useAppStore((s) => s.themeName);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const isNight = themeName === 'night';

  return (
    <button
      type="button"
      aria-label="Toggle background"
      title="Toggle background"
      onClick={toggleTheme}
      className="
        pointer-events-auto inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full
        bg-white/[0.04] border border-[var(--color-line)]
        transition-colors active:border-[var(--color-neon)]
      "
    >
      <span
        className="w-3.5 h-3.5 rounded-full"
        style={{
          background: isNight ? '#2bd4ff' : 'var(--color-neon)',
          boxShadow: isNight ? '0 0 10px rgba(43, 212, 255, 0.7)' : '0 0 10px rgba(255, 107, 28, 0.6)',
        }}
      />
    </button>
  );
}

/** Round day/night toggle button. Updates the `data-theme` attribute on
 *  <body> so CSS-only consumers stay in sync. */
export function ThemeToggle() {
  const themeName = useAppStore((s) => s.themeName);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const ref = useRef<HTMLButtonElement>(null);
  useMagnetic(ref, 0.4);

  useEffect(() => {
    document.body.dataset.theme = themeName;
  }, [themeName]);

  return (
    <button
      ref={ref}
      id="theme-toggle"
      type="button"
      aria-label="Toggle day/night"
      onClick={toggleTheme}
      className="
        bg-transparent border border-[var(--color-line)] rounded-full
        w-9 h-9 inline-grid place-items-center cursor-pointer
        transition-[border-color,background,transform] duration-200
        will-change-transform
        hover:border-[var(--color-neon)]
      "
    >
      <span
        className="w-3 h-3 rounded-full transition-[background,box-shadow] duration-300"
        style={{
          background: themeName === 'night' ? '#2bd4ff' : 'var(--color-neon)',
          boxShadow:
            themeName === 'night'
              ? '0 0 12px rgba(43, 212, 255, 0.7)'
              : '0 0 12px rgba(255, 107, 28, 0.6)',
        }}
      />
    </button>
  );
}
