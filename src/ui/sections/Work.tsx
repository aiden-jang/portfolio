import { useState } from 'react';
import { WORK_ITEMS } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';

type Props = { onOpen: (item: WorkDetail, el: HTMLElement) => void };
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'realtime', label: 'Realtime' },
  { id: 'ai', label: 'AI' },
  { id: 'social', label: 'For people' },
  { id: 'systems', label: 'Systems' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];
const PREVIEWS: Record<string, { image: string; description: string; caption: string }> = {
  everythingisfine: {
    image: '/projects/everythingisfine.png',
    description:
      'A live earthquake globe. Two agencies’ readings stay visible, including where they disagree.',
    caption: 'Live globe / earthquakes across the Pacific.',
  },
  owewell: {
    image: '/projects/owewell.png',
    description:
      'Shared expenses, itemized splits, and the smallest set of payments needed to settle up.',
    caption: 'Public bill-splitting interface / no account required.',
  },
};

export function WorkSection({ onOpen }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const apps = WORK_ITEMS.filter((item) => item.mark).sort(
    (a, b) => Number(Boolean(PREVIEWS[b.mark ?? ''])) - Number(Boolean(PREVIEWS[a.mark ?? ''])),
  );
  const visible =
    filter === 'all' ? apps : apps.filter((item) => item.categories?.includes(filter));
  return (
    <Section id="sec-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="panel garage-work pointer-events-auto">
        <div className="garage-work-heading">
          <h2>Selected work</h2>
          <span>Built independently</span>
        </div>
        <div className="garage-filters" aria-label="Filter projects">
          {FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="sr-only">
          Showing {visible.length} projects.
        </p>
        <div className="garage-project-list" tabIndex={0} aria-label="Project previews">
          {visible.map((item) => (
            <Project key={item.title} item={item} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </Section>
  );
}

function Project({ item, onOpen }: { item: WorkDetail } & Props) {
  const preview = PREVIEWS[item.mark ?? ''];
  return (
    <article className={`garage-project ${preview ? 'garage-project-featured' : ''}`}>
      <div className="garage-project-copy">
        <h3>{item.mark === 'everythingisfine' ? 'Everything is fine.' : item.shortName}</h3>
        <p>{preview?.description ?? item.tagline}</p>
        {preview && <p className="garage-stack">{item.stack.slice(0, 3).join(' · ')}</p>}
        <div className="garage-project-links">
          <button
            type="button"
            onClick={(event) => onOpen(item, event.currentTarget)}
            aria-label={`Read about ${item.shortName}`}
          >
            Read project ↗
          </button>
          {item.link && (
            <a
              href={item.link.url}
              target="_blank"
              rel="noopener"
              aria-label={`Open ${item.shortName}`}
            >
              Live app ↗
            </a>
          )}
        </div>
      </div>
      {preview && (
        <figure className={item.mark === 'everythingisfine' ? 'garage-globe-preview' : undefined}>
          <img src={preview.image} alt={`${item.shortName} product interface`} loading="lazy" />
          <figcaption>{preview.caption}</figcaption>
        </figure>
      )}
    </article>
  );
}
