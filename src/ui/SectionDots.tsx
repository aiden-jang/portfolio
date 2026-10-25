import { SECTION_IDS, SECTION_LABELS, type SectionId } from '../config';
import { useAppStore } from '../store';

type Props = {
  onJump: (id: SectionId) => void;
};

export function SectionDots({ onJump }: Props) {
  const activeIndex = useAppStore((s) => s.sectionIndex);
  return (
    <nav
      aria-label="Section progress"
      className="
        hidden md:flex flex-col gap-4 z-20
        fixed right-[2.4vw] top-1/2 -translate-y-1/2
      "
    >
      {SECTION_IDS.map((id, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onJump(id)}
            aria-label={`Go to ${SECTION_LABELS[id]}`}
            aria-current={active ? 'true' : undefined}
            className="group relative cursor-pointer flex items-center justify-center w-3 h-3"
          >
            <span
              className="
                absolute right-6 font-[var(--font-mono)] text-[0.62rem]
                tracking-[0.24em] uppercase text-[var(--color-muted)]
                opacity-0 -translate-x-1 transition-all duration-150 whitespace-nowrap
                group-hover:opacity-100 group-hover:translate-x-0
                group-focus-visible:opacity-100 group-focus-visible:translate-x-0
                pointer-events-none
              "
            >
              {SECTION_LABELS[id]}
            </span>
            <span
              className={`
                block rounded-full transition-all duration-200
                ${
                  active
                    ? 'w-2.5 h-2.5 bg-[var(--color-neon)] shadow-[0_0_10px_rgba(255,107,28,0.6)]'
                    : 'w-1.5 h-1.5 bg-[var(--color-muted)] group-hover:bg-[var(--color-fg)] group-hover:scale-125'
                }
              `}
            />
          </button>
        );
      })}
    </nav>
  );
}
