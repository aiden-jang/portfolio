import { useLayoutEffect, useRef, useState } from 'react';
import { SECTION_IDS, SECTION_LABELS, type SectionId } from '../config';
import { useAppStore } from '../store';
import { jumpToWork, workJumps } from './workJumps';
import { ResumeButton } from './ResumeButton';

const ITEMS = SECTION_IDS.map((id) => ({
  id,
  label: SECTION_LABELS[id],
  key: id.slice(4),
}));

type Props = {
  onLink: (id: SectionId) => void;
};

export function Nav({ onLink }: Props) {
  const activeId = SECTION_IDS[useAppStore((state) => state.sectionIndex)];
  const rail = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const projectGroup = useRef<HTMLDivElement>(null);
  const workLink = useRef<HTMLAnchorElement>(null);
  const [showProjects, setShowProjects] = useState(false);
  useLayoutEffect(() => {
    const group = rail.current;
    const line = marker.current;
    const selected = group?.querySelector<HTMLAnchorElement>('[aria-current="page"]');
    if (!group || !line || !selected) return;
    const place = () => {
      line.style.setProperty(
        '--nav-marker-x',
        selected.getBoundingClientRect().left - group.getBoundingClientRect().left + 'px',
      );
      line.style.setProperty('--nav-marker-width', String(selected.offsetWidth));
      line.dataset.ready = '';
    };
    place();
    const sizes = new ResizeObserver(place);
    sizes.observe(group);
    group.querySelectorAll('a').forEach((link) => sizes.observe(link));
    return () => sizes.disconnect();
  }, [activeId]);

  return (
    <nav id="nav" className="hidden md:flex items-center">
      <div ref={rail} className="nav-motion-rail hidden md:flex items-center gap-[1.4rem]">
        {ITEMS.map(({ id, key, label }) => {
          const featured = id === 'sec-work';
          const link = (
            <a
              key={id}
              ref={featured ? workLink : undefined}
              href={'#' + id}
              data-section={key}
              aria-current={id === activeId ? 'page' : undefined}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                setShowProjects(false);
                onLink(id);
              }}
              onFocus={featured ? () => setShowProjects(true) : undefined}
              onKeyDown={
                featured
                  ? (event) => {
                      if (event.key !== 'ArrowDown') return;
                      event.preventDefault();
                      setShowProjects(true);
                      requestAnimationFrame(() =>
                        projectGroup.current
                          ?.querySelector<HTMLAnchorElement>('.work-jumps a')
                          ?.focus(),
                      );
                    }
                  : undefined
              }
            >
              {label}
            </a>
          );
          return featured ? (
            <div
              key={id}
              className="nav-featured-group"
              ref={projectGroup}
              onPointerEnter={(event) => {
                if (event.pointerType !== 'touch') setShowProjects(true);
              }}
              onPointerLeave={(event) => {
                if (
                  event.pointerType !== 'touch' &&
                  !event.currentTarget.querySelector('.work-jumps :focus')
                )
                  setShowProjects(false);
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setShowProjects(false);
              }}
              onKeyDown={(event) => {
                if (event.key === 'Escape' && showProjects) {
                  event.stopPropagation();
                  workLink.current?.focus();
                  setShowProjects(false);
                }
              }}
            >
              {link}
              {showProjects && (
                <div className="work-jumps" role="group" aria-label="Jump to a project">
                  {workJumps.map(({ label, href }) => (
                    <a
                      key={href}
                      href={href}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
                          return;
                        event.preventDefault();
                        setShowProjects(false);
                        jumpToWork(href);
                      }}
                    >
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ) : (
            link
          );
        })}
        <span ref={marker} className="nav-motion-marker" aria-hidden="true" />
      </div>
      <ResumeButton />
    </nav>
  );
}
