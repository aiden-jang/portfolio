import { useEffect } from 'react';
import { LIGHTING_LABELS, nextLighting } from '../lighting';
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

  useEffect(() => {
    document.body.dataset.theme = themeName;
  }, [themeName]);

  return <LightingButton />;
}

export function MobileThemeButton() {
  return <LightingButton mobile />;
}

function LightingButton({ mobile = false }: { mobile?: boolean }) {
  const theme = useAppStore((state) => state.themeName);
  const toggle = useAppStore((state) => state.toggleTheme);
  const label = LIGHTING_LABELS[theme];
  const next = LIGHTING_LABELS[nextLighting(theme)];
  const icon = theme === 'night' ? <MoonIcon /> : <SunIcon />;
  return (
    <button
      type="button"
      aria-label={`Lighting: ${label}. Switch to ${next}`}
      title={`Lighting: ${label}`}
      onClick={toggle}
      className="scene-control-button"
    >
      {mobile ? (
        <>
          <span className="mobile-light-name">{label}</span>
          {icon}
        </>
      ) : (
        <>
          {icon}
          <span className="control-group-label">{label}</span>
        </>
      )}
    </button>
  );
}
