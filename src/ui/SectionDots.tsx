import { SECTION_IDS, type SectionId } from '../config';
import { useAppStore } from '../store';

const LABELS: Record<SectionId, string> = {
  'sec-intro': 'Intro',
  'sec-work': 'Work',
  'sec-about': 'About',
  'sec-resume': 'Resume',
  'sec-contact': 'Contact',
};

type Props = {
  onJump: (id: SectionId) => void;
};

/** Fixed section nav: vertical dot strip on the right (desktop) or horizontal
 *  labeled strip at the bottom (mobile). Desktop dots reveal labels on
 *  hover/focus; mobile labels are always visible since there's no top nav. */
export function SectionDots({ onJump }: Props) {
  const activeIndex = useAppStore((s) => s.sectionIndex);

  return (
    <nav
      aria-label="Section progress"
      className="
        fixed z-20 flex gap-4
        md:right-[2.4vw] md:top-1/2 md:-translate-y-1/2 md:flex-col
        bottom-[8vh] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0
        flex-row
      "
    >
      {SECTION_IDS.map((id, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onJump(id)}
            aria-label={`Go to ${LABELS[id]}`}
            aria-current={active ? 'true' : undefined}
            className="
              group relative cursor-pointer
              flex flex-col items-center gap-1.5
              md:w-3 md:h-3 md:gap-0 md:justify-center
            "
          >
            {/* Mobile: always-visible label stacked above the dot. */}
            <span
              className={`
                md:hidden font-[var(--font-mono)] text-[0.55rem] tracking-[0.2em]
                uppercase whitespace-nowrap transition-colors
                ${active ? 'text-[var(--color-neon)]' : 'text-[var(--color-muted)]'}
              `}
            >
              {LABELS[id]}
            </span>

            {/* Desktop: floating label to the left, revealed on hover or focus. */}
            <span
              className="
                hidden md:block absolute right-6 font-[var(--font-mono)] text-[0.62rem]
                tracking-[0.24em] uppercase text-[var(--color-muted)]
                opacity-0 -translate-x-1 transition-all duration-150 whitespace-nowrap
                group-hover:opacity-100 group-hover:translate-x-0
                group-focus-visible:opacity-100 group-focus-visible:translate-x-0
                pointer-events-none
              "
            >
              {LABELS[id]}
            </span>

            {/* The dot itself. */}
            <span
              className={`
                block rounded-full transition-all duration-200
                ${active
                  ? 'w-2.5 h-2.5 bg-[var(--color-neon)] shadow-[0_0_10px_rgba(255,107,28,0.6)]'
                  : 'w-1.5 h-1.5 bg-[var(--color-muted)] group-hover:bg-[var(--color-fg)] group-hover:scale-125'}
              `}
            />
          </button>
        );
      })}
    </nav>
  );
}
