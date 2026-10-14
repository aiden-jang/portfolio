import { useRef } from 'react';
import { useMagnetic } from '../hooks/useMagnetic';
import { SECTION_IDS, SECTION_LABELS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { ResumeButton } from './ResumeButton';

const ITEMS = SECTION_IDS.map((id) => ({ id, label: SECTION_LABELS[id], key: id.slice(4) }));

type Props = {
  onLink: (id: SectionId) => void;
};

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
      <div className="hidden md:flex items-center gap-[1.4rem]">
        {ITEMS.map((item) => (
          <NavLink
            key={item.id}
            item={item}
            active={activeId === item.id}
            onClick={() => onLink(item.id)}
          />
        ))}
      </div>
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
      aria-current={active ? 'page' : undefined}
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
