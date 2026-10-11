import { useState } from 'react';
import '../project-gallery.css';
import { WORK_ITEMS, workId } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ProjectPreview } from '../ProjectPreview';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

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
  worth: {
    image: '/projects/worth.png',
    description:
      'Rank the things you try, keep revisit logs, and remember what deserves another go.',
    caption: 'Public landing / a place for your taste.',
  },
  owewell: {
    image: '/projects/owewell.png',
    description:
      'Shared expenses, itemized splits, and the smallest set of payments needed to settle up.',
    caption: 'Public bill-splitting interface / no account required.',
  },
  auth: {
    image: '/projects/platform.png',
    description:
      'One account across the apps, with shared sign-in, recovery, and account settings.',
    caption: 'Public sign-in / the shared accounts service.',
  },
  iguess: {
    image: '/projects/iguess.png',
    description:
      'Draw with friends while an AI races to guess. Five game modes share one room engine.',
    caption: 'Public lobby / choose a mode and an extremely qualified avatar.',
  },
  wherever: {
    image: '/projects/wherever.png',
    description: 'Swipe on nearby restaurants together and let the group pick dinner.',
    caption: 'Public landing / the restaurant vote is a labeled example.',
  },
  bloomnote: {
    image: '/projects/bloomnote.png',
    description: 'Write someone a note and turn its details into a garden they can open.',
    caption: 'Public composer / an example garden beside your note.',
  },
  mrrp: {
    image: '/projects/mrrp.png',
    description: 'A private room for two, a pixel cat, and small ways to keep each other company.',
    caption: 'Public landing / the room preview, before making a room.',
  },
};

export function WorkSection({ onOpen }: Props) {
  const [filter, setFilter] = useState<FilterId>('all');
  const apps = WORK_ITEMS.filter((item) => item.mark).sort(
    (a, b) => Object.keys(PREVIEWS).indexOf(a.mark!) - Object.keys(PREVIEWS).indexOf(b.mark!),
  );
  const visible =
    filter === 'all' ? apps : apps.filter((item) => item.categories?.includes(filter));
  const featured = filter === 'all' ? visible.slice(0, 3) : [];
  const gallery = filter === 'all' ? visible.slice(3) : visible;
  return (
    <Section id="sec-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="garage-work pointer-events-auto">
        <div className="garage-work-heading">
          <h2>Selected work</h2>
          <span>Built independently</span>
        </div>
        <div className="project-toolbar">
          <div className="garage-filters" aria-label="Filter projects">
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => {
                  setFilter(option.id);
                  requestAnimationFrame(() =>
                    document
                      .getElementById('sec-work')
                      ?.scrollIntoView({ block: 'start', behavior: 'instant' }),
                  );
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="project-browse">
            <p aria-live="polite">{visible.length} projects</p>
            <select
              aria-label="Jump to a project"
              value=""
              onChange={(event) => {
                document.getElementById(`project-${event.target.value}`)?.scrollIntoView({
                  block: 'start',
                  behavior: prefersReducedMotion() ? 'instant' : 'smooth',
                });
              }}
            >
              <option value="" disabled>
                Jump to a project
              </option>
              {visible.map((item) => (
                <option key={item.title} value={workId(item)}>
                  {item.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="garage-project-list" aria-label="Project previews">
          {featured.length > 0 && (
            <div className="project-featured-group" aria-label="Featured projects">
              <p className="project-group-label">Featured / 03</p>
              {featured.map((item) => (
                <Project key={item.title} item={item} onOpen={onOpen} featured />
              ))}
            </div>
          )}
          {gallery.length > 0 && (
            <section className="project-gallery-group" aria-labelledby="gallery-heading">
              <div className="project-gallery-heading">
                <h3 id="gallery-heading">
                  {filter === 'all' ? 'More things I’ve shipped' : 'Matching projects'}
                </h3>
                {filter === 'all' && <span>Small apps. Whole products.</span>}
              </div>
              <div className="project-gallery">
                {gallery.map((item) => (
                  <Project key={item.title} item={item} onOpen={onOpen} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </Section>
  );
}

function Project({
  item,
  onOpen,
  featured = false,
}: { item: WorkDetail; featured?: boolean } & Props) {
  const preview = PREVIEWS[item.mark ?? ''];
  return (
    <article
      id={`project-${workId(item)}`}
      className={`garage-project ${featured ? 'garage-project-featured' : 'garage-project-compact'}`}
    >
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
            Case study ↗
          </button>
          {item.link && (
            <a
              href={item.link.url}
              target="_blank"
              rel="noopener"
              aria-label={`Open ${item.shortName}`}
            >
              Open app ↗
            </a>
          )}
        </div>
      </div>
      {preview && (
        <ProjectPreview
          image={preview.image}
          name={item.shortName ?? item.title}
          caption={preview.caption}
        />
      )}
    </article>
  );
}
