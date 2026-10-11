import { useEffect, useRef } from 'react';
import './portfolio-header.css';
import { SECTION_IDS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { Brand } from './Brand';
import { Nav } from './Nav';
import { ResumeButton } from './ResumeButton';

const LABELS = ['Intro', 'Experience', 'Projects', 'About', 'Contact'];

export function PortfolioHeader({ onLink }: { onLink: (id: SectionId) => void }) {
  const active = useAppStore((state) => state.sectionIndex);
  const menu = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (menu.current && event.target instanceof Node && !menu.current.contains(event.target))
        menu.current.open = false;
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);
  return (
    <div className={`portfolio-header ${active === 2 ? 'portfolio-header-reading' : ''}`}>
      <Brand onHome={() => onLink('sec-intro')} />
      <Nav onLink={onLink} />
      <div className="portfolio-mobile-header">
        <details
          ref={menu}
          className="portfolio-menu"
          onKeyDown={(event) => {
            if (event.key === 'Escape' && menu.current) {
              menu.current.open = false;
              menu.current.querySelector('summary')?.focus();
            }
          }}
        >
          <summary>
            Menu <span aria-hidden="true">+</span>
          </summary>
          <nav aria-label="Mobile navigation">
            {SECTION_IDS.map((id, index) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={active === index ? 'page' : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  if (menu.current) menu.current.open = false;
                  onLink(id);
                }}
              >
                <span>{LABELS[index]}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </details>
        <ResumeButton />
      </div>
    </div>
  );
}
