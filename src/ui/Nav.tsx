import { useRef } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';
import { SECTION_IDS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { ResumeButton } from './ResumeButton';
import { ThemeToggle } from './ThemeToggle';

const ITEMS: { id: SectionId; label: string; key: string }[] = [
  { id: 'sec-intro', label: 'Intro', key: 'intro' },
  { id: 'sec-experience', label: 'Experience', key: 'experience' },
  { id: 'sec-work', label: 'Projects', key: 'work' },
  { id: 'sec-about', label: 'About', key: 'about' },
  { id: 'sec-contact', label: 'Contact', key: 'contact' },
];

type Props = {
  onLink: (id: SectionId) => void;
};

/** Fixed top-right nav: section links + car switcher + color swatches + theme. */
export function Nav({ onLink }: Props) {
  const sectionIndex = useAppStore((s) => s.sectionIndex);
  const activeId = SECTION_IDS[sectionIndex];

  return (
    <nav
      id="nav"
      className="
        hidden md:flex
        fixed top-[4vh] right-[5vw] z-20 items-center gap-[1.4rem]
        font-[var(--font-mono)] text-[0.74rem] tracking-[0.18em] uppercase
      "
    >
      {/* Section links only appear at lg+, where they fit beside the brand.
          Below that (tablet), five links + the brand can't share the row
          without overlapping, so navigation falls to the section-dots rail. */}
      <div className="hidden lg:flex items-center gap-[1.4rem]">
        {ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={activeId === item.id}
            onClick={() => onLink(item.id)}
          />
        ))}
      </div>
      {/* Car + color controls live in the bottom dock (see App.tsx), not here:
          packed into this right-anchored row they made the nav wide enough to
          run back under the brand wordmark even on wide viewports. */}
      <ThemeToggle />
      <ResumeButton />
    </nav>
  );
}

function NavLink({
  item,
  active,
  onClick,
}: {
  item: { id: SectionId; label: string; key: string };
  active: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  useMagnetic(ref, 0.35);
  return (
    <a
      ref={ref}
      href={`#${item.id}`}
      data-section={item.key}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`
        group relative py-1.5
        transition-[color,transform] duration-200 will-change-transform
        ${
          active
            ? 'text-[var(--color-fg)]'
            : 'text-[var(--color-muted)] hover:text-[var(--color-fg)]'
        }
      `}
    >
      {item.label}
      <span
        className={`
          pointer-events-none absolute left-0 right-0 bottom-0 h-px
          bg-[var(--color-neon)] origin-left
          transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}
        `}
      />
    </a>
  );
}
