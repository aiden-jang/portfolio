import '../project-gallery.css';
import '../reading-layout.css';
import { PREVIEWS } from '../../data/projectPreviews';
import { FEATURED_PROJECTS, visibleProjects, type ProjectFilter } from '../../data/workBrowsing';
import { workId } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ProjectPreview } from '../ProjectPreview';
import { IodineContributions } from '../IodineContributions';
import { prefersReducedMotion } from '../../hooks/reducedMotion';
import { cancelSmoothScroll } from '../../hooks/scrollNavigation';
import { useActiveProject } from '../useActiveProject';

type Props = { onOpen: (item: WorkDetail, el: HTMLElement) => void };
type BrowseProps = Props & {
  filter: ProjectFilter;
  onFilterChange: (filter: ProjectFilter) => void;
};
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'realtime', label: 'Real-time' },
  { id: 'ai', label: 'AI' },
  { id: 'social', label: 'For people' },
  { id: 'systems', label: 'Systems' },
] as const;
export function WorkSection({ onOpen, filter, onFilterChange }: BrowseProps) {
  const visible = visibleProjects(filter);
  const activeProject = useActiveProject(visible.map(workId));
  const changeFilter = (next: ProjectFilter) => {
    cancelSmoothScroll();
    onFilterChange(next);
    requestAnimationFrame(() =>
      document.getElementById('sec-work')?.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
  };
  const featured =
    filter === 'all' ? visible.filter((item) => FEATURED_PROJECTS.includes(item.shortName!)) : [];
  const gallery =
    filter === 'all'
      ? visible.filter((item) => !FEATURED_PROJECTS.includes(item.shortName!))
      : visible;
  return (
    <Section id="sec-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="garage-work pointer-events-auto">
        <div className="garage-work-heading">
          <h2>Selected work</h2>
          <span>Personal products & open source</span>
        </div>
        <div className="project-toolbar">
          <select
            className="mobile-project-filter"
            aria-label="Filter projects"
            aria-describedby="project-count"
            value={filter}
            onChange={(event) => changeFilter(event.target.value as ProjectFilter)}
          >
            {FILTERS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label === 'All' ? 'All projects' : option.label}
              </option>
            ))}
          </select>
          <div className="garage-filters" aria-label="Filter projects">
            <span className="filter-label">Show</span>
            {FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => changeFilter(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="project-browse">
            <p id="project-count" aria-live="polite">
              {visible.length} projects
            </p>
            <select
              aria-label="Jump to a project"
              value={activeProject}
              onChange={(event) => {
                cancelSmoothScroll();
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
              <p className="project-group-label">
                Featured / {String(featured.length).padStart(2, '0')}
              </p>
              {featured.map((item) => (
                <Project key={item.title} item={item} onOpen={onOpen} featured />
              ))}
            </div>
          )}
          {gallery.length > 0 && (
            <section className="project-gallery-group" aria-labelledby="gallery-heading">
              <div className="project-gallery-heading">
                <h3 id="gallery-heading">
                  {filter === 'all' ? 'More projects' : 'Matching projects'}
                </h3>
                {filter === 'all' && <span>Still worth a look.</span>}
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
        <div className="project-title">
          <p className="project-role">
            {item.contribution ? 'Open-source contributor' : 'Designed & built'}
          </p>
          <h3>{item.shortName}</h3>
        </div>
        <p>{preview?.description ?? item.summary}</p>
        <p className="garage-stack">{item.stack.slice(0, 3).join(' · ')}</p>
        <div className="garage-project-links">
          <button
            type="button"
            onClick={(event) => onOpen(item, event.currentTarget)}
            aria-label={
              item.contribution
                ? `My contributions to ${item.shortName}`
                : `How I built it: ${item.shortName}`
            }
          >
            {item.contribution ? 'My contributions ↗' : 'How I built it ↗'}
          </button>
          {item.link && (
            <a
              href={item.link.url}
              target="_blank"
              aria-describedby="external-link-hint"
              rel="noopener"
              aria-label={`Open ${item.shortName}`}
            >
              {item.contribution ? 'Contributions ↗' : 'Open app ↗'}
            </a>
          )}
        </div>
      </div>
      {preview && (
        <ProjectPreview
          image={preview.image}
          name={item.shortName ?? item.title}
          caption={preview.caption}
          states={featured ? preview.states : undefined}
        />
      )}
      {item.contribution && <IodineContributions />}
    </article>
  );
}
