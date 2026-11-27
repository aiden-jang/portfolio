import { followWorkIndex } from './workIndexNavigation';
import { Brand } from './Brand';
import { ResumeButton } from './ResumeButton';
import type { SectionId } from '../config';
import './portfolio-header.css';
import './playable-route.css';
import './exhibition-header.css';

export function PortfolioHeader({ onLink }: { onLink: (id: SectionId) => void }) {
  return (
    <div className="portfolio-header playable-header">
      <Brand onHome={() => onLink('sec-intro')} />
      <nav className="route-nav" aria-label="Portfolio navigation">
        <a href="/work/" aria-label="Work index" onClick={followWorkIndex}>
          Work
        </a>
        <a className="route-contact-link" href="#sec-contact">
          Contact
        </a>
        <ResumeButton />
      </nav>
    </div>
  );
}
