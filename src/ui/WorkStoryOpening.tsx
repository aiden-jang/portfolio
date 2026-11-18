import { workId } from '../data/workItems';
import './request-comparison.css';
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
  if (workId(item) === 'ad-slot-details-120-1-api-call') return <RequestComparison />;
  return <p className="work-modal-summary">{item.summary}</p>;
}

function RequestComparison() {
  return (
    <section className="request-comparison" aria-label="Request batching">
      <h4 className="request-lead" aria-label="Page load went from about 60 seconds to two">
        <span aria-hidden="true">60s</span>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12h15m-5-5 5 5-5 5"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span aria-hidden="true">2s</span>
      </h4>
      <p className="request-intro">
        Page load time after combining linked line items into one response.
      </p>
      <figure className="request-figure">
        <div className="request-panels">
          <div className="request-panel">
            <h5>
              Before <span>120 calls</span>
            </h5>
            <div className="request-lanes" aria-hidden="true">
              {Array.from({ length: 12 }, (_, lane) => (
                <div
                  className="request-lane"
                  style={{ paddingInlineStart: `${lane * 2.1}%` }}
                  key={lane}
                >
                  {Array.from({ length: 10 }, (_, call) => (
                    <i key={call} />
                  ))}
                </div>
              ))}
            </div>
            <p>One request per linked line item.</p>
          </div>
          <div className="request-panel request-panel-after">
            <h5>
              After <span>1 call</span>
            </h5>
            <div className="request-single" aria-hidden="true">
              <i />
            </div>
            <p>One response with the joined data.</p>
          </div>
        </div>
        <figcaption>
          Request pattern reconstructed from the case study. Bar positions and lengths are
          illustrative.
        </figcaption>
      </figure>
    </section>
  );
}
