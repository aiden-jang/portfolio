import { DinnerTable } from '../showcase/DinnerTable';
import { BloomPreview } from '../showcase/BloomPreview';
import { Duet } from '../showcase/Duet';

import { SceneAppLink } from '../showcase/ProjectScene';
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
import '../showcase/live-project-index.css';
import '../showcase/editorial-motion.css';
import './editorial-cut.css';

type Props = { onOpen: (item: WorkDetail, el: HTMLElement) => void };
const projects = visibleProjects('all');
const meanwhile = projects.find((item) => item.mark === 'everythingisfine')!;
const collection = projects.filter((item) => !FEATURED_PROJECTS.includes(workId(item)));
const editorialOrder = ['bloomnote', 'mrrp', 'worth', 'wherever', 'owewell', 'iguess', 'platform'];
const orderedCollection = editorialOrder
  .map((id) => collection.find((item) => workId(item) === id))
  .filter((item): item is WorkDetail => !!item)
  .concat(collection.filter((item) => !editorialOrder.includes(workId(item))));

export function WorkSection() {
  return (
    <Section id="sec-work" side="center" desktopVertical="top" mobileVertical="top">
      <div className="garage-work pointer-events-auto">
        <h2 className="sr-only">Featured work</h2>
        <div className="work-exhibit">
          <EarthquakeFeature item={meanwhile} preview={PREVIEWS.everythingisfine} />
          <IodinePresentation />
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
const worth = orderedCollection.find((item) => item.mark === 'worth')!;
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
        <h2 className="sr-only">More projects</h2>
        <BloomPreview
          {...PREVIEWS.bloomnote}
          url={bloomnote.link?.url}
          onRead={(trigger) => onOpen(bloomnote, trigger)}
        />
        <div className="garage-work bloom-gallery-rest">
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
            <DinnerTable
              dinner={wherever.link!.url}
              bill={owewell.link!.url}
              worth={worth.link!.url}
              onReadBill={(trigger) => onOpen(owewell, trigger)}
              onReadWorth={(trigger) => onOpen(worth, trigger)}
            />
          </div>
        </div>
      </div>
    </Section>
  );
}
