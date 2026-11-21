import type { PickedEvent } from './globe/data';
export function GlobeEventCard({
  event,
  onClose,
  onCompare,
}: {
  event: PickedEvent;
  onClose: () => void;
  onCompare?: (trigger: HTMLButtonElement) => void;
}) {
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
        M{event.magnitude} <span>{event.scale === 'unknown' ? '' : event.scale}</span>
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
        UTC · USGS ·{' '}
        {Number.isFinite(event.depth) ? event.depth + ' km deep' : 'Depth not reported'}
      </p>
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
