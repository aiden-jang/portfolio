import { useLayoutEffect, useRef } from 'react';
import { SECTION_IDS, SECTION_LABELS, type SectionId } from '../config';
import { useAppStore } from '../store';
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
  useLayoutEffect(() => {
    const group = rail.current;
    const line = marker.current;
    const selected = group?.querySelector<HTMLAnchorElement>('[aria-current="page"]');
    if (!group || !line || !selected) return;
    const place = () => {
      line.style.setProperty('--nav-marker-x', selected.offsetLeft + 'px');
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
        {ITEMS.map(({ id, key, label }) => (
          <a
            key={id}
            href={'#' + id}
            data-section={key}
            aria-current={id === activeId ? 'page' : undefined}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              onLink(id);
            }}
          >
            {label}
          </a>
        ))}
        <span ref={marker} className="nav-motion-marker" aria-hidden="true" />
      </div>
      <ResumeButton />
    </nav>
  );
}
