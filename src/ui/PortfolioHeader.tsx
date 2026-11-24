import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './portfolio-header.css';
import { SECTION_IDS, SECTION_LABELS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { Brand } from './Brand';
import { Nav } from './Nav';
import { ResumeButton } from './ResumeButton';
import { ControlIcon } from './ControlIcon';
import { COMMAND_MENU_EVENT } from './useCommandMenuEvents';

export function PortfolioHeader({ onLink }: { onLink: (id: SectionId) => void }) {
  const active = useAppStore((state) => state.sectionIndex);
  const activeSection = SECTION_IDS[active];
  const [open, setOpen] = useState(false);
  const menu = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (panel.current) panel.current.inert = !open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !menu.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  const closeAndFocus = () => {
    setOpen(false);
    button.current?.focus({ preventScroll: true });
  };
  return (
    <div className="portfolio-header">
      <Brand onHome={() => onLink('sec-intro')} />
      <Nav onLink={onLink} />
      <div className="portfolio-mobile-header">
        <div
          ref={menu}
          className="portfolio-menu"
          data-open={open}
          onBlur={(event) => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
              setOpen(false);
          }}
          onKeyDown={(event) => {
            if (event.key !== 'Escape' || !open) return;
            event.preventDefault();
            event.stopPropagation();
            closeAndFocus();
          }}
        >
          <button
            type="button"
            ref={button}
            className="portfolio-menu-trigger"
            aria-controls="mobile-navigation"
            aria-expanded={open}
            aria-label={active > 0 ? `Menu: ${SECTION_LABELS[SECTION_IDS[active]]}` : 'Menu'}
            onClick={() => setOpen((current) => !current)}
          >
            <span className="portfolio-menu-label">
              {activeSection === 'sec-work'
                ? 'Featured'
                : activeSection === 'sec-more-work'
                  ? 'Projects'
                  : active > 0
                    ? SECTION_LABELS[activeSection]
                    : 'Menu'}
            </span>
            <span aria-hidden="true">+</span>
          </button>
          <nav
            ref={panel}
            id="mobile-navigation"
            aria-label="Mobile navigation"
            aria-hidden={!open}
          >
            {SECTION_IDS.map((id, index) => (
              <a
                key={id}
                href={'#' + id}
                aria-current={active === index ? 'page' : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  closeAndFocus();
                  onLink(id);
                }}
              >
                <span>{SECTION_LABELS[id]}</span>
                <ControlIcon name="arrow" />
              </a>
            ))}
            <button
              type="button"
              onClick={() => {
                closeAndFocus();
                window.dispatchEvent(new Event(COMMAND_MENU_EVENT));
              }}
            >
              Search controls <ControlIcon name="arrow" />
            </button>
          </nav>
        </div>
        <ResumeButton />
      </div>
    </div>
  );
}
