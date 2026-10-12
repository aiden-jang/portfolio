import '../project-gallery.css';
import { PREVIEWS } from '../../data/projectPreviews';
import { visibleProjects, type ProjectFilter } from '../../data/workBrowsing';
import { workId } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ProjectPreview } from '../ProjectPreview';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';

type Props = { onOpen: (item: WorkDetail, el: HTMLElement) => void };
type BrowseProps = Props & {
  filter: ProjectFilter;
  onFilterChange: (filter: ProjectFilter) => void;
};
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'realtime', label: 'Realtime' },
  { id: 'ai', label: 'AI' },
  { id: 'social', label: 'For people' },
  { id: 'systems', label: 'Systems' },
] as const;
export function WorkSection({ onOpen, filter, onFilterChange }: BrowseProps) {
  const visible = visibleProjects(filter);
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
                  onFilterChange(option.id);
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
        <h3>{item.shortName}</h3>
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
