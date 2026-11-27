import { caseStudyLane } from '../data/workBrowsing';
import type { WorkDetail } from '../types';
import { ControlIcon } from './ControlIcon';

type Props = {
  onPrevious: () => void;
  onNext: () => void;
  item: WorkDetail;
};

const stepButton =
  'grid h-11 w-11 md:h-9 md:w-9 place-items-center rounded-full border border-[var(--color-line)] text-[var(--color-muted)] transition-colors hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]';

export function WorkModalNav({ onPrevious, onNext, item }: Props) {
  const lane = caseStudyLane(item, 'all');
  const position = lane.indexOf(item) + 1;
  const next = lane[position % lane.length];
  const nextName = next.navigationTitle ?? next.shortName ?? next.displayTitle ?? next.title;
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
        <span className="work-modal-position ml-2">
          {position} / {lane.length}
        </span>
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
