import { useState } from 'react';

const placements = [
  { name: 'Homepage', size: '970 × 250', impressions: '180,000', schedule: 'Jun 1–30' },
  { name: 'Newsletter', size: '600 × 200', impressions: '48,000', schedule: 'Jun 5–26' },
  { name: 'Mobile web', size: '320 × 50', impressions: '95,000', schedule: 'Jun 1–30' },
];

export function BatchingLineItems({ loaded }: { loaded: boolean }) {
  const [selected, select] = useState(0);
  const item = placements[selected]!;
  return (
    <div className="batching-line-items" data-loaded={loaded} aria-label="Sample line items">
      <div className="batching-line-heading">
        <strong>Line items</strong>
        <span>Sample data</span>
      </div>
      <div className="batching-placement-list" role="group" aria-label="Choose a line item">
        {placements.map(({ name }, index) => (
          <button
            key={name}
            type="button"
            aria-disabled={!loaded}
            aria-pressed={selected === index}
            onClick={() => {
              if (loaded) select(index);
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <dl className="batching-placement-detail" aria-live="off" aria-busy={!loaded}>
        <div>
          <dt>Size</dt>
          <dd>{loaded ? item.size : '—'}</dd>
        </div>
        <div>
          <dt>Impressions</dt>
          <dd>{loaded ? item.impressions : '—'}</dd>
        </div>
        <div>
          <dt>Schedule</dt>
          <dd>{loaded ? item.schedule : '—'}</dd>
        </div>
      </dl>
    </div>
  );
}
