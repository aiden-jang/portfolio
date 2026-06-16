import { SECTION_IDS, type SectionId } from '../config';
import { useAppStore } from '../store';

const LABELS: Record<SectionId, string> = {
  'sec-intro': 'Intro',
  'sec-work': 'Work',
  'sec-about': 'About',
  'sec-experience': 'Experience',
  'sec-contact': 'Contact',
};

type Props = {
  onJump: (id: SectionId) => void;
  /** `rail`: vertical dot strip fixed to the right edge (desktop), labels
   *  revealed on hover/focus. `bar`: horizontal dots with the active section
   *  named above, rendered in-flow so a parent can place it inside the mobile
   *  bottom bar. */
  placement: 'rail' | 'bar';
};

/** Section progress + jump control. Two presentations share the dot/jump
 *  logic; the parent picks one per breakpoint. */
export function SectionDots({ onJump, placement }: Props) {
  const activeIndex = useAppStore((s) => s.sectionIndex);

  if (placement === 'bar') {
    const activeId = SECTION_IDS[activeIndex];
    return (
      <nav
        aria-label="Section progress"
        className="pointer-events-auto flex flex-col items-center gap-1.5"
      >
        <span className="font-[var(--font-mono)] text-[0.55rem] tracking-[0.26em] uppercase text-[var(--color-neon)]">
          {LABELS[activeId]}
        </span>
        <div className="flex flex-row items-center gap-1">
          {SECTION_IDS.map((id, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onJump(id)}
                aria-label={`Go to ${LABELS[id]}`}
                aria-current={active ? 'true' : undefined}
                className="flex items-center justify-center min-w-[34px] min-h-[30px]"
              >
                <span
                  className={`
                    block rounded-full transition-all duration-200
                    ${
                      active
                        ? 'w-2 h-2 bg-[var(--color-neon)] shadow-[0_0_10px_rgba(255,107,28,0.6)]'
                        : 'w-1.5 h-1.5 bg-[var(--color-muted)]'
                    }
                  `}
                />
              </button>
            );
          })}
        </div>
      </nav>
    );
  }

  // rail (desktop)
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
            aria-label={`Go to ${LABELS[id]}`}
            aria-current={active ? 'true' : undefined}
            className="group relative cursor-pointer flex items-center justify-center w-3 h-3"
          >
            {/* Floating label to the left, revealed on hover or focus. */}
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
              {LABELS[id]}
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
