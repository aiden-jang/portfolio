import { useEffect, useState } from 'react';
import { BODY_COLOR_PALETTE, useAppStore } from '../store';

const SWATCH_TITLES: Record<string, string> = {
  '#ff6b1c': 'Signal Orange',
  '#b00020': 'Crimson',
  '#0a0a0c': 'Gloss Black',
  '#f5f1e8': 'Pearl White',
  '#194527': 'Racing Green',
  '#163a8a': 'Royal Blue',
};

/** Body-color swatches. Applies to the detected body material on the current
 *  car. The "active" indicator reads from the store, so the same indicator
 *  also reflects keyboard-triggered color changes (e.g. pressing `C`). */
export function ColorSwatches() {
  const carIndex = useAppStore((s) => s.carIndex);
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const applyBodyColor = useAppStore((s) => s.applyBodyColor);
  const refs = useAppStore((s) => s.refs);
  const [hasBody, setHasBody] = useState(false);

  // Poll for the body material once after a car load (the GLB load is async,
  // so we can't read it synchronously after the carIndex changes).
  useEffect(() => {
    const check = () => setHasBody(!!refs.bodyMaterial?.color);
    check();
    const id = window.setInterval(check, 200);
    return () => window.clearInterval(id);
  }, [carIndex, refs]);

  // Always rendered so the nav layout doesn't shift when the body material
  // finishes detecting. Visually muted + non-interactive while we wait.
  return (
    <div
      id="car-color-wrap"
      aria-label="Body color"
      aria-hidden={!hasBody}
      className={`
        inline-flex items-center gap-1.5 px-1.5 h-9 border-x border-[var(--color-line)]
        transition-opacity duration-200
        ${hasBody ? 'opacity-100' : 'opacity-30 pointer-events-none'}
      `}
    >
      <SwatchButton
        original
        title="Original"
        active={activeBodyColor === 'original'}
        onClick={() => applyBodyColor('original')}
      />
      {BODY_COLOR_PALETTE.map((color) => (
        <SwatchButton
          key={color}
          color={color}
          title={SWATCH_TITLES[color] ?? color}
          active={activeBodyColor === color}
          onClick={() => applyBodyColor(color)}
        />
      ))}
    </div>
  );
}

function SwatchButton({
  color,
  original,
  active,
  title,
  onClick,
}: {
  color?: string;
  original?: boolean;
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`
        swatch w-[22px] h-[22px] rounded-full p-0 cursor-pointer
        transition-transform hover:scale-[1.12]
        border border-[var(--color-line)] hover:border-[var(--color-fg)]
        ${original ? 'swatch-original' : ''}
        ${active ? 'border-[var(--color-neon)] shadow-[0_0_0_2px_rgba(255,107,28,0.4)]' : ''}
      `}
      style={!original && color ? { background: color } : undefined}
    />
  );
}
