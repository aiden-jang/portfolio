import { useState } from 'react';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { useRef } from 'react';
import example from '../../data/iodineExample.json';

export function IodineWalkthrough({ image, caption }: { image: string; caption: string }) {
  const [restored, setRestored] = useState(false),
    [viewer, setViewer] = useState(false);
  const inspect = useRef<HTMLButtonElement>(null);
  const source = restored ? example.restored : example.after;
  return (
    <>
      <figure className="iodine-example" data-undo-state={restored ? 'restored' : 'edited'}>
        <div className="iodine-editor">
          <header>
            <span>{example.file}</span>
            <span>{restored ? 'Restored' : 'Edited'}</span>
          </header>
          <div
            className="iodine-code"
            key={String(restored)}
            aria-label={restored ? 'Original file restored' : 'File after example edit'}
          >
            {source
              .trimEnd()
              .split('\n')
              .map((line, index) => (
                <div key={index} className={index === 1 ? 'changed-line' : ''}>
                  <span aria-hidden="true">{index + 1}</span>
                  <code>{line}</code>
                </div>
              ))}
          </div>
          <div className="iodine-feedback" aria-live="polite">
            <strong>
              {restored ? 'File restored. Feedback queued.' : 'An edit, with a way back.'}
            </strong>
            <p>
              {restored
                ? example.feedback.guidance
                : 'Iodine keeps the previous contents before writing an edit.'}
            </p>
          </div>
          <footer>
            <button className="example-action" type="button" onClick={() => setRestored((v) => !v)}>
              {restored ? 'Replay edit' : 'Undo edit'}
            </button>
            <button
              ref={inspect}
              type="button"
              onClick={() => setViewer(true)}
              aria-label="Inspect screenshot: iodine"
            >
              View screenshot
            </button>
          </footer>
        </div>
        <figcaption>
          Recorded local example using Iodine’s snapshot and revert code.{' '}
          <a
            href={example.source}
            target="_blank"
            rel="noopener"
            aria-describedby="external-link-hint"
          >
            View contribution <span aria-hidden="true">↗</span>
          </a>
        </figcaption>
      </figure>
      {viewer && (
        <ScreenshotViewer
          image={image}
          caption={caption}
          name="iodine"
          returnFocus={inspect.current}
          onClose={() => setViewer(false)}
        />
      )}
    </>
  );
}
