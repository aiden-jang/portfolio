import { useRef } from 'react';
import { useMapEditorCut } from '../showcase/useMapEditorCut';
import { BloomPreview } from '../showcase/BloomPreview';
import { Duet } from '../showcase/Duet';

import { ProjectScene, SceneAppLink, DinnerScene } from '../showcase/ProjectScene';
import { EarthquakeFeature } from '../showcase/EarthquakeFeature';
import { IodinePresentation } from '../showcase/IodinePresentation';
import '../project-gallery.css';
import '../showcase/project-scene-flow.css';
import '../showcase/receipt-worth.css';
import { PREVIEWS } from '../../data/projectPreviews';
import { FEATURED_PROJECTS, visibleProjects } from '../../data/workBrowsing';
import { workId } from '../../data/workItems';
import type { WorkDetail } from '../../types';
import { Section } from './shared';
import { ProjectPreview } from '../ProjectPreview';
import { ControlIcon } from '../ControlIcon';
import { PlatformHandoff } from '../showcase/PlatformHandoff';

type Props = { onOpen: (item: WorkDetail, el: HTMLElement) => void };
const projects = visibleProjects('all');
const featured = projects.filter((item) => FEATURED_PROJECTS.includes(workId(item)));
const collection = projects.filter((item) => !FEATURED_PROJECTS.includes(workId(item)));
const editorialOrder = ['bloomnote', 'mrrp', 'worth', 'wherever', 'owewell', 'iguess', 'platform'];
const orderedCollection = editorialOrder
  .map((id) => collection.find((item) => workId(item) === id))
  .filter((item): item is WorkDetail => !!item)
  .concat(collection.filter((item) => !editorialOrder.includes(workId(item))));

export function WorkSection() {
  const featuredGroup = useRef<HTMLDivElement>(null);
  useMapEditorCut(featuredGroup);
  return (
    <Section id="sec-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="garage-work pointer-events-auto">
        <h2 className="featured-work-heading">Featured work</h2>
        <div
          ref={featuredGroup}
          className="garage-project-list project-featured-group"
          aria-label="Featured projects"
        >
          {featured.map((item) =>
            item.mark === 'everythingisfine' ? (
              <EarthquakeFeature key={item.title} item={item} preview={PREVIEWS.everythingisfine} />
            ) : (
              <IodinePresentation key={item.title} />
            ),
          )}
        </div>
      </div>
    </Section>
  );
}

const bloomnote = orderedCollection.find((item) => item.mark === 'bloomnote')!;
const iguess = orderedCollection.find((item) => item.mark === 'iguess')!;
const mrrp = orderedCollection.find((item) => item.mark === 'mrrp')!;
const wherever = orderedCollection.find((item) => item.mark === 'wherever')!;
const owewell = orderedCollection.find((item) => item.mark === 'owewell')!;
const supportingProjects = orderedCollection.filter(
  (item) => ![bloomnote, iguess, mrrp, wherever, owewell].includes(item),
);
function AppLink({ item, label }: { item: WorkDetail; label?: string }) {
  if (!item.link) return null;
  return (
    <SceneAppLink href={item.link.url} name={item.shortName ?? item.title}>
      {label}
    </SceneAppLink>
  );
}

export function MoreProjectsSection({ onOpen }: Props) {
  return (
    <Section id="sec-more-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="bloom-gallery pointer-events-auto">
        <BloomPreview
          {...PREVIEWS.bloomnote}
          url={bloomnote.link?.url}
          onRead={(trigger) => onOpen(bloomnote, trigger)}
        />
        <div className="garage-work bloom-gallery-rest">
          <h2 className="project-gallery-heading">More projects</h2>
          <div className="project-scenes">
            <Duet
              drawTitle={
                <button
                  type="button"
                  aria-label="How I built it: iguess"
                  onClick={(event) => onOpen(iguess, event.currentTarget)}
                >
                  iguess
                </button>
              }
              drawLink={<AppLink item={iguess} />}
              roomLink={<AppLink item={mrrp} />}
            />
            <ProjectScene
              id="project-wherever"
              theme="dinner"
              title={
                <>
                  <span className="dinner-title-vote">
                    <AppLink item={wherever} label="wherever" />
                  </span>
                  <span className="dinner-handoff" aria-hidden="true">
                    /
                  </span>
                  <span className="dinner-title-bill">
                    <AppLink item={owewell} label="owewell" />
                  </span>
                </>
              }
              links={null}
            >
              <DinnerScene />
            </ProjectScene>
          </div>
          <div className="project-gallery gallery-companions">
            {supportingProjects.map((item) => (
              <Project key={item.title} item={item} onOpen={onOpen} />
            ))}
          </div>
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
  const copy = (
    <div className="garage-project-copy">
      <div className="project-card-heading">
        {title}
        {link}
      </div>
      {item.contribution && <p className="project-role">Open-source contributor</p>}
      <p>{description}</p>
    </div>
  );
  return (
    <article id={`project-${workId(item)}`} className="garage-project garage-project-compact">
      <div className="project-card-media">
        {item.mark === 'auth' && !location.search.includes('preview=platform') ? (
          <>
            <PlatformHandoff />
            <details className="platform-screenshots">
              <summary>View screenshots</summary>
              {media}
            </details>
          </>
        ) : (
          media
        )}
      </div>
      {copy}
    </article>
  );
}
