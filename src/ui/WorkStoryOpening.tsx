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
      <section className="featured-story-opening" aria-label="Agent edit undo">
        <h4>
          An agent edit <br />
          you can undo.
        </h4>
        <p>
          I contributed file snapshots and revert feedback to Iodine, an open-source IDE with an AI
          agent.
        </p>
        <IodineContribution reader />
      </section>
    );
  }
  return <p className="work-modal-summary">{item.summary}</p>;
}
