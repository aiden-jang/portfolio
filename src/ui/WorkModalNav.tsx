import { ControlIcon } from './ControlIcon';

type Props = {
  onPrevious: () => void;
  onNext: () => void;
  position: { current: number; total: number } | null;
  nextName: string;
};

const stepButton =
  'grid h-11 w-11 md:h-9 md:w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]';

export function WorkModalNav({ onPrevious, onNext, position, nextName }: Props) {
  return (
    <div className="work-modal-nav shrink-0 flex items-center justify-between gap-3 px-5 md:px-7 py-3 border-t border-[var(--color-line)]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevious}
          aria-label="Previous case study"
          className={stepButton}
        >
          <ControlIcon name="arrow" className="rotate-180" />
        </button>
        {position && (
          <span className="work-modal-position ml-2">
            {position.current} / {position.total}
          </span>
        )}
        <button
          type="button"
          onClick={onNext}
          aria-label="Next case study"
          title={`Next: ${nextName}`}
          className={`${stepButton} work-modal-next`}
        >
          <span>Next: {nextName}</span>
          <ControlIcon name="arrow" />
        </button>
      </div>
    </div>
  );
}
