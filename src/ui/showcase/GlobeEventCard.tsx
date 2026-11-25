import { kamchatkaExample } from '../../data/kamchatkaExample';
import { evidenceHref, type StoryId } from '../creative/storyRoutes';
import type { MouseEvent } from 'react';
import type { PickedEvent } from './globe/data';
type Agency = (typeof kamchatkaExample.sources)[number]['name'];
export type GlobeEvidence = {
  agency: Agency;
  setAgency: (agency: Agency) => void;
  openEvidence: ((event: MouseEvent<HTMLAnchorElement>, id: StoryId) => boolean) | null;
};

export function GlobeEventCard({
  event,
  onClose,
  onCompare,
  evidence,
}: {
  event: PickedEvent;
  onClose: () => void;
  evidence?: GlobeEvidence;
  onCompare?: (trigger: HTMLButtonElement) => void;
}) {
  const selectedReport = evidence
    ? kamchatkaExample.sources.find((report) => report.name === evidence.agency)
    : undefined;
  return (
    <aside
      className="orbit-event"
      aria-label="Selected earthquake"
      aria-live="polite"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <button type="button" aria-label="Close event details" onClick={onClose}>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m6 6 12 12M18 6 6 18" />
        </svg>
      </button>
      <h4>
        M{event.magnitude}{' '}
        <span>{selectedReport?.scale ?? (event.scale === 'unknown' ? '' : event.scale)}</span>
      </h4>
      <p className="orbit-event-place">{event.place}</p>
      <p>
        {new Date(event.time).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          timeZone: 'UTC',
        })}{' '}
        UTC
        {!evidence && (
          <>
            {' '}
            · USGS ·{' '}
            {Number.isFinite(event.depth) ? event.depth + ' km deep' : 'Depth not reported'}
          </>
        )}
      </p>
      {evidence && (
        <div className="orbit-evidence">
          <div role="group" aria-label="Choose a Kamchatka reading">
            {kamchatkaExample.sources.map(({ name, depthKm }) => (
              <button
                key={name}
                type="button"
                aria-pressed={name === evidence.agency}
                onClick={() => evidence.setAgency(name)}
              >
                {name} <strong>{depthKm.toFixed(1)} km</strong>
              </button>
            ))}
          </div>
          <a
            href={evidenceHref('everythingisfine', { agency: evidence.agency })}
            onClick={(event) => evidence.openEvidence?.(event, 'everythingisfine')}
          >
            Read case study <span aria-hidden="true">→</span>
          </a>
        </div>
      )}
      {onCompare && (
        <button
          className="orbit-compare-event"
          type="button"
          onClick={(event) => onCompare(event.currentTarget)}
        >
          Compare both reports
        </button>
      )}
      <a href={event.url} target="_blank" rel="noopener" aria-describedby="external-link-hint">
        Open this event <span aria-hidden="true">↗</span>
      </a>
    </aside>
  );
}
