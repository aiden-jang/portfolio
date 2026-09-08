type Props = {
  onPrevious: () => void;
  onNext: () => void;
  position: { current: number; total: number } | null;
};

const stepButton =
  'grid h-9 w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]';

export function WorkModalNav({ onPrevious, onNext, position }: Props) {
  return (
    <div className="shrink-0 flex items-center justify-between gap-3 px-5 md:px-7 py-3 border-t border-[var(--color-line)]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous case study"
          className={stepButton}
        >
          ←
        </button>
        <button type="button" onClick={onNext} aria-label="Next case study" className={stepButton}>
          →
        </button>
        {position && (
          <>
            <span className="ml-2 font-[var(--font-mono)] text-[0.58rem] tracking-[0.14em] text-[var(--color-muted)]">
              {position.current} / {position.total}
            </span>
            <span
              role="progressbar"
              aria-label="Case study progress"
              aria-valuemin={1}
              aria-valuemax={position.total}
              aria-valuenow={position.current}
              className="ml-1 h-px w-8 overflow-hidden bg-white/[0.14]"
            >
              <span
                className="block h-full origin-left bg-[var(--color-neon)] transition-transform duration-300"
                style={{ transform: `scaleX(${position.current / position.total})` }}
              />
            </span>
          </>
        )}
      </div>
      <span className="font-[var(--font-mono)] text-[0.5rem] tracking-[0.1em] uppercase text-[rgba(244,240,255,0.38)] md:hidden">
        Swipe to browse
      </span>
      <span className="font-[var(--font-mono)] text-[0.55rem] tracking-[0.12em] uppercase text-[rgba(244,240,255,0.38)] max-md:hidden">
        ← → browse
      </span>
    </div>
  );
}
