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
import { ControlIcon } from '../ControlIcon';

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
        <h2 className="project-gallery-heading">More projects</h2>
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
  const name = item.shortName ?? item.title;
  const preview = PREVIEWS[item.mark ?? ''];
  const description = preview?.description ?? item.summary;
  const title = (
    <div className="project-title">
      <h3>
        <button
          type="button"
          onClick={(event) => onOpen(item, event.currentTarget)}
          aria-label={`How I built it: ${name}`}
        >
          {name}
          <ControlIcon name="arrow" />
        </button>
      </h3>
      {item.shortName === 'mrrp' && <Bean />}
    </div>
  );
  const link = item.link && (
    <div className="garage-project-links">
      <a
        href={item.link.url}
        target="_blank"
        aria-describedby="external-link-hint"
        rel="noopener"
        aria-label={item.contribution ? `View changes on GitHub: ${name}` : `Open app: ${name}`}
      >
        {item.contribution ? 'View changes on GitHub' : 'Open app'}
        <span aria-hidden="true">↗</span>
      </a>
    </div>
  );
  const media = preview && (
    <ProjectPreview
      image={preview.image}
      name={name}
      caption={preview.caption}
      states={preview.states}
    />
  );
  if (item.mark === 'bloomnote') {
    return (
      <article id={`project-${workId(item)}`} className="garage-project bloom-spread">
        <header className="bloom-spread-heading">
          <div>
            {title}
            <p>{description}</p>
          </div>
          {link}
        </header>
        {media}
      </article>
    );
  }
  return (
    <article id={`project-${workId(item)}`} className="garage-project garage-project-compact">
      {media}
      <div className="garage-project-copy">
        <div className="project-card-heading">
          {title}
          {link}
        </div>
        {item.contribution && <p className="project-role">Open-source contributor</p>}
        <p>{description}</p>
      </div>
    </article>
  );
}
