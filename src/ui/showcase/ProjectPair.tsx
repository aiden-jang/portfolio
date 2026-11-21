import { useRef, useState, type PointerEvent } from 'react';
import { ControlIcon } from '../ControlIcon';
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
  const [step, setStep] = useState(0);
  const [view, setView] = useState<number | null>(null);
  const inspect = useRef<HTMLButtonElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  const frames = evidence[name];
  const selected = view === null ? null : frames[view];
  const current = frames[step]!;
  const label = name === 'wherever' ? 'Sample dinner round' : 'Shared sign-in';
  const action = name === 'wherever' ? 'Show dinner result' : 'Open worth';
  const compare = (event: PointerEvent<HTMLDivElement>, complete: boolean) => {
    const start = drag.current;
    if (!start || event.pointerId !== start.id) return;
    const delta = event.clientX - start.x;
    const horizontal = Math.abs(delta) > Math.abs(event.clientY - start.y);
    if (!complete) {
      const limit = event.currentTarget.clientWidth * 0.75;
      if (horizontal)
        track.current?.style.setProperty(
          '--sequence-motion',
          Math.min(limit, Math.max(-limit, delta)) + 'px',
        );
      return;
    }
    if (horizontal && Math.abs(delta) > 52) setStep(delta < 0 ? 1 : 0);
    clearDrag();
  };
  const clearDrag = () => {
    drag.current = null;
    track.current?.removeAttribute('data-dragging');
    track.current?.style.removeProperty('--sequence-motion');
  };
  return (
    <>
      <figure className="project-pair preview-sequence" data-pair={name} aria-label={label}>
        <div
          className="preview-sequence-stage"
          onPointerDown={(event) => {
            if (!event.isPrimary || event.button !== 0) return;
            drag.current = {
              id: event.pointerId,
              x: event.clientX,
              y: event.clientY,
            };
            track.current?.setAttribute('data-dragging', '');
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => compare(event, false)}
          onPointerUp={(event) => compare(event, true)}
          onPointerCancel={clearDrag}
          onLostPointerCapture={clearDrag}
        >
          <div className="preview-sequence-track" data-step={step} ref={track}>
            {frames.map((frame, index) => (
              <div className="preview-sequence-frame" key={frame.key} aria-hidden={step !== index}>
                {name === 'wherever' && index === 0 ? (
                  <>
                    <img
                      src="/projects/wherever-tacos.jpg"
                      alt="Tacos from the sample dinner round"
                      width={700}
                      height={467}
                      loading="lazy"
                    />
                    <span className="wherever-exhibit-title">Probably Fine Tacos</span>
                  </>
                ) : (
                  <ScreenshotImage
                    src={'/projects/' + frame.key + '-detail.webp'}
                    alt={frame.title}
                    lazy
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="preview-sequence-tools">
          <div className="preview-sequence-steps" role="group" aria-label="Screenshot steps">
            {frames.map((frame, index) => (
              <button
                key={frame.key}
                type="button"
                aria-pressed={step === index}
                onClick={() => setStep(index)}
              >
                {frame.title}
              </button>
            ))}
          </div>
          <button
            type="button"
            ref={inspect}
            onClick={() => setView(step)}
            aria-label={'Inspect screenshot: ' + current.title}
            className="preview-sequence-inspect"
          >
            <ControlIcon name="fit" />
          </button>
        </div>
        <figcaption className="preview-sequence-caption">
          <p aria-live="polite">{current.caption}</p>
          <button type="button" onClick={() => setStep(step === 0 ? 1 : 0)}>
            {step === 0 ? action : 'Replay'} <ControlIcon name="arrow" />
          </button>
        </figcaption>
      </figure>
      {selected && view !== null && (
        <ScreenshotViewer
          name={name}
          image={'/projects/' + selected.key + '.webp'}
          caption={selected.caption}
          returnFocus={inspect.current}
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
