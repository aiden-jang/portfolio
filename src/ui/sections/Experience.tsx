import { WORK_ITEMS } from '../../data/workItems';
import type { WorkDetail } from '../WorkModal';
import { EYEBROW, H2, P_LI, Section, UL_BASE } from './shared';

const ROLES = [
  'Software Engineer · Zeta Global · 2024–present',
  'Software Engineer · LiveIntent · 2023–2024',
  'Associate Software Engineer · LiveIntent · 2022–2023',
];

type Props = {
  onOpen: (item: WorkDetail, el: HTMLElement) => void;
};

/** Professional experience: the roles timeline plus the highlight case studies
 *  (the non-app WORK_ITEMS). Clicking a highlight opens its full write-up. This
 *  leads the page — it's the strongest signal for hiring — with the side
 *  projects following in their own section. */
export function ExperienceSection({ onOpen }: Props) {
  const highlights = WORK_ITEMS.filter((i) => !i.mark);

  return (
    <Section id="sec-experience" side="left">
      <div className="panel pointer-events-auto w-full max-w-[540px]">
        <span className={EYEBROW}>01 / EXPERIENCE</span>
        <h2 className={H2}>Experience</h2>
        <ul className={`${UL_BASE} ${P_LI}`}>
          {ROLES.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>

        <p className="mt-5 mb-0.5 font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase text-[var(--color-muted)]">
          Highlights
        </p>
        <div>
          {highlights.map((item) => (
            <HighlightRow key={item.title} item={item} onOpen={(el) => onOpen(item, el)} />
          ))}
        </div>
      </div>
    </Section>
  );
}

/** Clickable one-line highlight that opens the full case-study modal. */
function HighlightRow({ item, onOpen }: { item: WorkDetail; onOpen: (el: HTMLElement) => void }) {
  return (
    <button
      type="button"
      onClick={(e) => onOpen(e.currentTarget)}
      className="
        group w-full text-left block py-[0.4rem]
        border-y border-transparent rounded-md -mx-2 px-2
        transition-colors duration-200
        hover:border-[var(--color-line)] hover:bg-white/[0.02]
      "
    >
      <p className="text-[rgba(244,240,255,0.8)] text-[0.85rem] leading-[1.45] m-0 line-clamp-1 transition-colors group-hover:text-[var(--color-fg)]">
        {item.summary}
      </p>
    </button>
  );
}
