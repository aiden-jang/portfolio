import { Bean } from '../showcase/Bean';
import { EarthquakeFeature } from '../showcase/EarthquakeFeature';
import { IodinePresentation } from '../showcase/IodinePresentation';
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
        <h2 className="sr-only">Featured work</h2>
        <div className="garage-project-list project-featured-group" aria-label="Featured projects">
          {featured.map((item) =>
            item.mark === 'everythingisfine' ? (
              <EarthquakeFeature
                key={item.title}
                item={item}
                preview={PREVIEWS.everythingisfine}
                onOpen={onOpen}
              />
            ) : (
              <IodinePresentation
                key={item.title}
                item={item}
                preview={PREVIEWS.iodine}
                onOpen={onOpen}
              />
            ),
          )}
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

function Project({ item, onOpen }: { item: WorkDetail } & Props) {
  const preview = PREVIEWS[item.mark ?? ''];
  return (
    <article id={`project-${workId(item)}`} className="garage-project garage-project-compact">
      <div className="garage-project-copy">
        <div className="project-title">
          <h3>
            <button
              type="button"
              onClick={(event) => onOpen(item, event.currentTarget)}
              aria-label={'How I built it: ' + item.shortName}
            >
              {item.shortName}
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 12h15m-5-5 5 5-5 5" />
              </svg>
            </button>
          </h3>
          {item.shortName === 'mrrp' && <Bean />}
          {item.contribution && <p className="project-role">Open-source contributor</p>}
        </div>
        <p>{preview?.description ?? item.summary}</p>
        <p className="garage-stack">{item.stack.slice(0, 3).join(' · ')}</p>
        <div className="garage-project-links">
          {item.link && (
            <a
              href={item.link.url}
              target="_blank"
              aria-describedby="external-link-hint"
              rel="noopener"
              aria-label={
                item.contribution
                  ? `View changes on GitHub: ${item.shortName}`
                  : `Open ${item.shortName}`
              }
            >
              {item.contribution ? 'View changes on GitHub ↗' : 'Open app ↗'}
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
