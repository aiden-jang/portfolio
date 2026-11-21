import { workId } from '../data/workItems';
import './request-comparison.css';
import { RequestReplay } from './RequestReplay';
import { CareerEvidence } from './CareerEvidence';
import './reader-cover.css';
import { PREVIEWS } from '../data/projectPreviews';
import { StoryScreenshot } from './StoryScreenshot';
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
          I built the matching logic so two agencies can report the same quake without losing either
          source’s measurements.
        </p>
        <EarthquakeMatch />
      </section>
    );
  }
  if (item.mark === 'iodine') {
    return (
      <section className="featured-story-opening" aria-label="Iodine contributions">
        <StoryCover kind="iodine" />
        <h4>
          Scoped approvals. <br />
          Recoverable edits.
        </h4>
        <p>
          I built scoped terminal approvals and Undo that tells the agent what changed when a file
          is restored. I also made file paths in agent replies and tool results clickable.
        </p>
        <IodineContribution reader />
      </section>
    );
  }
  if (workId(item) === 'ad-slot-details-120-1-api-call') return <RequestComparison />;
  return (
    <>
      {item.mark === 'bloomnote' && (
        <>
          <StoryCover kind="bloomnote" />
          <figure className="reader-gerbera">
            <div className="bloom-spread-gerbera" aria-hidden="true" />
            <figcaption>
              <strong>Gerbera</strong>
              <span>
                “For that brilliant laugh that comes from deep inside, especially at your own
                jokes.”
              </span>
            </figcaption>
          </figure>
        </>
      )}
      <p className="work-modal-summary">{item.summary}</p>
      <CareerEvidence id={workId(item)} />
    </>
  );
}

function StoryCover({ kind }: { kind: 'iodine' | 'bloomnote' }) {
  return (
    <StoryScreenshot
      image={PREVIEWS[kind].image}
      name={kind}
      caption={kind === 'iodine' ? 'Editor and agent' : 'The received garden'}
      cover={kind}
    />
  );
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
      <RequestReplay />
    </section>
  );
}
