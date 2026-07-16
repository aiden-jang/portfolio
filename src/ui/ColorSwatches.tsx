import { BODY_COLOR_SWATCHES, useAppStore } from '../store';

/** Compact tappable color control for the mobile bottom bar. The 7-swatch row
 *  is too dense on a phone, so this is a single 44px round button that cycles
 *  the car's body color on tap and shows the current one as a dot — small
 *  enough to sit on one line beside the car switcher, even on a 320px screen. */
export function MobileColorButton() {
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const cycleBodyColor = useAppStore((s) => s.cycleBodyColor);
  const hasBody = useAppStore((s) => s.hasBodyMaterial);
  const isOriginal = activeBodyColor === 'original';

  return (
    <button
      type="button"
      aria-label="Change car color"
      title="Change car color"
      onClick={cycleBodyColor}
      disabled={!hasBody}
      className="
        pointer-events-auto inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full cursor-pointer
        bg-white/[0.04] border border-[var(--color-line)]
        transition-colors active:border-[var(--color-neon)]
        disabled:opacity-30 disabled:pointer-events-none
      "
    >
      <span
        className={`swatch w-5 h-5 rounded-full border border-[var(--color-line)] ${
          isOriginal ? 'swatch-original' : ''
        }`}
        style={isOriginal ? undefined : { background: activeBodyColor }}
      />
    </button>
  );
}

/** Body-color swatches. Applies to the detected body material on the current
 *  car. The "active" indicator reads from the store, so the same indicator
 *  also reflects keyboard-triggered color changes (e.g. pressing `C`).
 *
 *  `bordered` draws the side dividers used inside the desktop nav row; the
 *  standalone mobile instance turns it off. */
export function ColorSwatches({ bordered = true }: { bordered?: boolean }) {
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const applyBodyColor = useAppStore((s) => s.applyBodyColor);
  const hasBody = useAppStore((s) => s.hasBodyMaterial);

  // Always rendered so the nav layout doesn't shift when the body material
  // finishes detecting. Visually muted + non-interactive while we wait.
  return (
    <div
      aria-label="Body color"
      aria-hidden={!hasBody}
      className={`
        inline-flex items-center gap-1.5 px-1.5 h-9
        ${bordered ? 'border-x border-[var(--color-line)]' : ''}
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
      {BODY_COLOR_SWATCHES.map(({ hex, name }) => (
        <SwatchButton
          key={hex}
          color={hex}
          title={name}
          active={activeBodyColor === hex}
          onClick={() => applyBodyColor(hex)}
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
        swatch w-7 h-7 md:w-[22px] md:h-[22px] rounded-full p-0 cursor-pointer
        transition-transform hover:scale-[1.12]
        border border-[var(--color-line)] hover:border-[var(--color-fg)]
        ${original ? 'swatch-original' : ''}
        ${active ? 'border-[var(--color-neon)] shadow-[0_0_0_2px_rgba(255,107,28,0.4)]' : ''}
      `}
      style={!original && color ? { background: color } : undefined}
    />
  );
}
