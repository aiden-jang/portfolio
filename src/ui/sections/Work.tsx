import { WORK_ITEMS } from '../../data/workItems';
import type { WorkDetail } from '../WorkModal';
import { EYEBROW, H2, Section } from './shared';

type Props = {
  onOpen: (item: WorkDetail) => void;
};

export function WorkSection({ onOpen }: Props) {
  return (
    <Section id="sec-work" side="right">
      <div className="panel pointer-events-auto max-w-[500px]">
        <span className={EYEBROW}>01 / WORK</span>
        <h2 className={H2}>Selected work</h2>
        <div className="mt-4">
          {WORK_ITEMS.map((item) => (
            <WorkRow key={item.title} item={item} onOpen={() => onOpen(item)} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Editorial-row item used in the Work section. Clicking opens the full
 *  case-study modal. Borders + bg appear only on hover, matching the
 *  paragraph-style rhythm of the other sections. */
function WorkRow({ item, onOpen }: { item: WorkDetail; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        group w-full text-left block py-2.5
        border-y border-transparent rounded-md -mx-2 px-2
        transition-colors duration-200
        hover:border-[var(--color-line)] hover:bg-white/[0.02]
      "
    >
      <p className="text-[rgba(244,240,255,0.82)] text-[clamp(0.95rem,1.25vw,1.02rem)] leading-[1.55] m-0 transition-colors group-hover:text-[var(--color-fg)]">
        {item.link && <LiveBadge />}
        {item.summary}
      </p>
    </button>
  );
}

/** Small "● LIVE" chip prefixed to rows that have an external link. */
function LiveBadge() {
  return (
    <span
      className="
        inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full align-[1px]
        font-[var(--font-mono)] text-[0.6rem] tracking-[0.18em] uppercase
        text-[var(--color-neon)] bg-[rgba(255,107,28,0.1)]
        border border-[rgba(255,107,28,0.4)]
      "
    >
      <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-neon)] animate-pulse" />
      Live
    </span>
  );
}
