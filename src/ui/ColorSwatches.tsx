import { BODY_COLOR_SWATCHES, useAppStore } from '../store';

// The full swatch row does not fit beside the car switcher at 320px, so the phone gets one
// cycling button instead.
export function MobileColorButton() {
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const cycleBodyColor = useAppStore((s) => s.cycleBodyColor);
  const hasBody = useAppStore((s) => s.hasBodyMaterial);
  const isOriginal = activeBodyColor === 'original';
  const colorName = isOriginal
    ? 'Original'
    : BODY_COLOR_SWATCHES.find((swatch) => swatch.hex === activeBodyColor)?.name;

  return (
    <button
      type="button"
      aria-label={`Paint: ${colorName}. Change color`}
      title={`Paint: ${colorName}`}
      onClick={cycleBodyColor}
      disabled={!hasBody}
      className="
        pointer-events-auto inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-full cursor-pointer
        bg-white/[0.04] border border-[var(--color-line)]
        transition-colors active:border-[var(--color-neon)]
        disabled:opacity-30 disabled:pointer-events-none
      "
    >
      <span className="mobile-paint-name">{colorName}</span>
      <span
        className={`swatch w-5 h-5 rounded-full border border-[var(--color-line)] ${
          isOriginal ? 'swatch-original' : ''
        }`}
        style={isOriginal ? undefined : { background: activeBodyColor }}
      />
    </button>
  );
}

export function ColorSwatches({ bordered = true }: { bordered?: boolean }) {
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const applyBodyColor = useAppStore((s) => s.applyBodyColor);
  const hasBody = useAppStore((s) => s.hasBodyMaterial);

  // Always rendered, muted, so the nav does not shift when material detection finishes.
  return (
    <div
      role="group"
      aria-label="Paint"
      aria-hidden={!hasBody}
      className={`
        inline-flex items-center gap-1.5 px-1.5 h-9
        ${bordered ? 'border-x border-[var(--color-line)]' : ''}
        transition-opacity duration-200
        ${hasBody ? 'opacity-100' : 'opacity-30 pointer-events-none'}
      `}
    >
      <span className="control-group-label" aria-hidden="true">
        Paint
      </span>
      <SwatchButton
        original
        title="Original"
        active={activeBodyColor === 'original'}
        disabled={!hasBody}
        onClick={() => applyBodyColor('original')}
      />
      {BODY_COLOR_SWATCHES.map(({ hex, name }) => (
        <SwatchButton
          key={hex}
          color={hex}
          title={name}
          active={activeBodyColor === hex}
          disabled={!hasBody}
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
  disabled,
  onClick,
}: {
  color?: string;
  original?: boolean;
  active: boolean;
  title: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-color-swatch="true"
      data-paint-name={title}
      title={title}
      aria-label={`Paint: ${title}`}
      aria-pressed={active}
      disabled={disabled}
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
