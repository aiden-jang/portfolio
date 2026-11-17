import type { WorkDetail } from '../types';
import { EarthquakeMatch } from './showcase/EarthquakeEvidence';
import { IodineContribution } from './showcase/IodineContribution';

export function WorkStoryOpening({ item }: { item: WorkDetail }) {
  if (item.mark === 'everythingisfine') {
    return (
      <section className="featured-story-opening" aria-label="Earthquake matching">
        <h4>
          One quake. <br />
          Keep both readings.
        </h4>
        <p>
          I built the matching logic for Everything Is Fine so two agencies can report the same
          quake without losing either source’s measurements.
        </p>
        <EarthquakeMatch />
      </section>
    );
  }
  if (item.mark === 'iodine') {
    return (
      <section className="featured-story-opening" aria-label="Iodine contributions">
        <h4>
          Scoped approvals. <br />
          Recoverable edits.
        </h4>
        <p>
          I built scoped terminal approvals and an undo system that restores files and tells the AI
          agent what changed. I also made file paths in agent replies and tool results clickable, so
          developers can jump straight to the relevant file and line.
        </p>
        <IodineContribution reader />
      </section>
    );
  }
  return <p className="work-modal-summary">{item.summary}</p>;
}
