import { SECTION_IDS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { CarSwitcher } from './CarSwitcher';
import { ColorSwatches } from './ColorSwatches';
import { ThemeToggle } from './ThemeToggle';

const ITEMS: { id: SectionId; label: string; key: string }[] = [
  { id: 'sec-intro', label: 'Intro', key: 'intro' },
  { id: 'sec-work', label: 'Work', key: 'work' },
  { id: 'sec-about', label: 'About', key: 'about' },
  { id: 'sec-resume', label: 'Resume', key: 'resume' },
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
        fixed top-[4vh] right-[5vw] z-20 flex items-center gap-[1.4rem]
        font-[var(--font-mono)] text-[0.74rem] tracking-[0.18em] uppercase
      "
    >
      {ITEMS.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          data-section={item.key}
          onClick={(e) => {
            e.preventDefault();
            onLink(item.id);
          }}
          className={`
            py-1.5 border-b transition-colors
            ${activeId === item.id
              ? 'text-[var(--color-fg)] border-[var(--color-neon)]'
              : 'text-[var(--color-muted)] border-transparent hover:text-[var(--color-fg)] hover:border-[var(--color-neon)]'}
          `}
        >
          {item.label}
        </a>
      ))}
      <CarSwitcher />
      <ColorSwatches />
      <ThemeToggle />
    </nav>
  );
}
