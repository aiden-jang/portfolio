import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

const SWATCHES: { color: string; title: string }[] = [
  { color: '#ff6b1c', title: 'Signal Orange' },
  { color: '#b00020', title: 'Crimson' },
  { color: '#0a0a0c', title: 'Gloss Black' },
  { color: '#f5f1e8', title: 'Pearl White' },
  { color: '#194527', title: 'Racing Green' },
  { color: '#163a8a', title: 'Royal Blue' },
];

/** Body-color swatches. Applies to the detected body material on the current
 *  car. Resets to "Original" whenever the car changes. */
export function ColorSwatches() {
  const carIndex = useAppStore((s) => s.carIndex);
  const refs = useAppStore((s) => s.refs);
  const [activeColor, setActiveColor] = useState<string>('original');
  const [hasBody, setHasBody] = useState(false);

  // Poll for the body material once after a car load (the GLB load is async,
  // so we can't read it synchronously after the carIndex changes).
  useEffect(() => {
    setActiveColor('original');
    const check = () => {
      setHasBody(!!refs.bodyMaterial?.color);
    };
    check();
    const id = window.setInterval(check, 200);
    return () => window.clearInterval(id);
  }, [carIndex, refs]);

  const apply = (color: string) => {
    const mat = refs.bodyMaterial;
    if (!mat?.color) return;
    if (color === 'original') {
      if (refs.bodyOriginalColor) mat.color.copy(refs.bodyOriginalColor);
    } else {
      mat.color.set(color);
    }
    setActiveColor(color);
  };

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
        active={activeColor === 'original'}
        onClick={() => apply('original')}
      />
      {SWATCHES.map((s) => (
        <SwatchButton
          key={s.color}
          color={s.color}
          title={s.title}
          active={activeColor === s.color}
          onClick={() => apply(s.color)}
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
