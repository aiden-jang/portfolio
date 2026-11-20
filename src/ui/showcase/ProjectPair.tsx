import { useRef, useState } from 'react';
import { ScreenshotImage } from '../ScreenshotImage';
import { ScreenshotViewer } from '../ScreenshotViewer';
import './project-pair.css';

const evidence = {
  wherever: [
    {
      key: 'wherever-vote',
      title: 'Cast a vote',
      caption: 'Alex and Maya vote in a local room with sample restaurants.',
    },
    {
      key: 'wherever-winner',
      title: 'Dinner is handled',
      caption: 'Both people picked Probably Fine Tacos in the same sample round.',
    },
  ],
  platform: [
    {
      key: 'platform-hub',
      title: 'Choose an app',
      caption: 'The account hub lists the connected apps for a local test account.',
    },
    {
      key: 'platform-app',
      title: 'Already signed in',
      caption: 'The same local account opens worth with its archive and account controls ready.',
    },
  ],
} as const;

export function ProjectPair({ name }: { name: keyof typeof evidence }) {
  const [view, setView] = useState<number | null>(null);
  const lastTrigger = useRef<HTMLButtonElement | null>(null);
  const frames = evidence[name];
  const selected = view === null ? null : frames[view];
  return (
    <>
      <figure
        className="project-pair"
        data-pair={name}
        aria-label={name === 'wherever' ? 'Sample dinner round' : 'Test account handoff'}
      >
        {frames.map((frame, index) => (
          <button
            className="project-pair-frame"
            type="button"
            key={frame.key}
            aria-label={`Inspect screenshot: ${frame.title}`}
            onClick={(event) => {
              lastTrigger.current = event.currentTarget;
              setView(index);
            }}
          >
            <span className="project-pair-photo">
              <ScreenshotImage src={`/projects/${frame.key}-detail.webp`} alt="" lazy />
            </span>
            <span className="project-pair-label">{frame.title}</span>
          </button>
        ))}
      </figure>
      {selected && view !== null && (
        <ScreenshotViewer
          name={name}
          image={`/projects/${selected.key}.webp`}
          caption={selected.caption}
          returnFocus={lastTrigger.current}
          onClose={() => setView(null)}
          navigation={{
            index: view,
            count: frames.length,
            label: selected.title,
            onSelect: setView,
          }}
        />
      )}
    </>
  );
}
