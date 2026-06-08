import { useEffect } from 'react';
import { useAppStore } from '../store';

/** Round day/night toggle button. Updates the `data-theme` attribute on
 *  <body> so CSS-only consumers stay in sync. */
export function ThemeToggle() {
  const themeName = useAppStore((s) => s.themeName);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  useEffect(() => {
    document.body.dataset.theme = themeName;
  }, [themeName]);

  return (
    <button
      id="theme-toggle"
      type="button"
      aria-label="Toggle day/night"
      onClick={toggleTheme}
      className="
        bg-transparent border border-[var(--color-line)] rounded-full
        w-9 h-9 inline-grid place-items-center cursor-pointer
        transition-colors hover:border-[var(--color-neon)]
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
