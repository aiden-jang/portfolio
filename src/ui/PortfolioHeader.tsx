import type { MouseEvent } from 'react';
import { SECTION_IDS } from '../config';
import { useAppStore } from '../store';
import { Brand } from './Brand';
import { ResumeButton } from './ResumeButton';
import type { SectionId } from '../config';
import './portfolio-header.css';
import './playable-route.css';
import './exhibition-header.css';

const destinations = [
  ['sec-experience', 'Experience'],
  ['sec-more-work', 'Projects'],
  ['sec-contact', 'Contact'],
] as const;

export function PortfolioHeader({ onLink }: { onLink: (id: SectionId) => void }) {
  const current = useAppStore((state) => SECTION_IDS[state.sectionIndex]);
  const jump = (event: MouseEvent<HTMLAnchorElement>, id: SectionId) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    onLink(id);
  };
  return (
    <div className="portfolio-header playable-header">
      <Brand onHome={() => onLink('sec-intro')} />
      <nav className="route-nav" aria-label="Portfolio navigation">
        {destinations.map(([id, label]) => (
          <a
            key={id}
            href={'#' + id}
            className={id === 'sec-contact' ? 'route-contact-link' : undefined}
            aria-current={current === id ? 'location' : undefined}
            onClick={(event) => jump(event, id)}
          >
            {label}
          </a>
        ))}
        <ResumeButton />
      </nav>
    </div>
  );
}
