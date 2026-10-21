import { useAppStore } from '../store';
import { CARS } from '../config';
import { paintChoices, paintFinish } from '../paint';

export function MobileColorButton() {
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const cycleBodyColor = useAppStore((s) => s.cycleBodyColor);
  const hasBody = useAppStore((s) => s.hasBodyMaterial);
  const carIndex = useAppStore((s) => s.carIndex);
  const finish = paintFinish(CARS[carIndex], activeBodyColor);
  const colorName = finish.name;

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
        className="swatch w-5 h-5 rounded-full border border-[var(--color-line)]"
        style={{ background: finish.hex }}
      />
    </button>
  );
}

export function ColorSwatches({ bordered = true }: { bordered?: boolean }) {
  const carIndex = useAppStore((s) => s.carIndex);
  const activeBodyColor = useAppStore((s) => s.activeBodyColor);
  const applyBodyColor = useAppStore((s) => s.applyBodyColor);
  const hasBody = useAppStore((s) => s.hasBodyMaterial);

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
      {paintChoices(CARS[carIndex]).map(({ hex, name, value }) => (
        <SwatchButton
          key={value}
          color={hex}
          title={value === 'original' ? `${name} (default)` : name}
          active={activeBodyColor === value}
          disabled={!hasBody}
          onClick={() => applyBodyColor(value)}
        />
      ))}
    </div>
  );
}

function SwatchButton({
  color,
  active,
  title,
  disabled,
  onClick,
}: {
  color: string;
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
        ${active ? 'border-[var(--color-neon)] shadow-[0_0_0_2px_rgba(255,107,28,0.4)]' : ''}
      `}
      style={{ background: color }}
    />
  );
}
