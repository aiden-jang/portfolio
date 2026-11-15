import '../project-gallery.css';
import { PREVIEWS } from '../../data/projectPreviews';
import { FEATURED_PROJECTS, visibleProjects } from '../../data/workBrowsing';
import { workId } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ProjectPreview } from '../ProjectPreview';

type Props = { onOpen: (item: WorkDetail, el: HTMLElement) => void };
const projects = visibleProjects('all');
const featured = projects.filter((item) => FEATURED_PROJECTS.includes(item.shortName!));
const collection = projects.filter((item) => !FEATURED_PROJECTS.includes(item.shortName!));

export function WorkSection({ onOpen }: Props) {
  return (
    <Section id="sec-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="garage-work pointer-events-auto">
        <div className="garage-work-heading">
          <h2>Selected work</h2>
          <span>Personal products &amp; open source</span>
        </div>
        <div className="garage-project-list project-featured-group" aria-label="Featured projects">
          {featured.map((item) => (
            <Project key={item.title} item={item} onOpen={onOpen} featured />
          ))}
        </div>
      </div>
    </Section>
  );
}

export function MoreProjectsSection({ onOpen }: Props) {
  return (
    <Section id="sec-more-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="garage-work pointer-events-auto">
        <div className="project-gallery-heading">
          <h2>More projects</h2>
          <span>Seven more things I’ve built.</span>
        </div>
        <div className="garage-project-list project-gallery" aria-label="More projects">
          {collection.map((item) => (
            <Project key={item.title} item={item} onOpen={onOpen} />
          ))}
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
          {item.contribution && <p className="project-role">Open-source contributor</p>}
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
          states={preview.states}
        />
      )}
    </article>
  );
}
