import { useCallback, useRef, useState } from 'react';
import example from '../../data/iodineExample.json';
import { evidenceHref } from '../creative/storyRoutes';
import { useTimedScene } from '../../hooks/useTimedScene';
import './iodine-timed.css';
import { ProjectScene } from './ProjectScene';

export function IodinePresentation() {
  const frame = useRef<HTMLDivElement>(null);
  const [restored, restore] = useState(false);
  const draw = useCallback((progress: number) => {
    const editor = frame.current;
    if (!editor) return;
    const phase = progress === 0 ? 'ready' : progress < 0.56 ? 'reviewing' : 'restored';
    if (editor.dataset.playback === phase) return;
    editor.dataset.playback = phase;
    restore(phase === 'restored');
  }, []);
  useTimedScene(frame, draw, { duration: 1720, hold: 3900 });

  const [first, second, last] = example.after.trimEnd().split('\n');
  const [start, end] = second!.trim().split('.trim()');
  return (
    <ProjectScene
      id="project-iodine"
      theme="iodine"
      title="iodine"
      links={
        <a
          aria-label="Read the iodine case study"
          href={evidenceHref('iodine', { edit: restored ? 'restored' : undefined })}
        >
          Case study ↗
        </a>
      }
    >
      <div className="recovery" ref={frame} data-restored={restored}>
        <div className="recovery-meta">
          <code>{example.file}:2</code>
          <span role="status" aria-live="off">
            {restored ? 'File restored' : 'Agent edit'}
          </span>
        </div>
        <div className="recovery-source">
          <pre className="sr-only">
            <code>{restored ? example.restored : example.after}</code>
          </pre>
          <div aria-hidden="true">{first}</div>
          <div className="recovery-line" aria-hidden="true">
            {start}
            <span className="removed">
              <mark>.trim()</mark>
            </span>
            {end}
          </div>
          <div aria-hidden="true">{last}</div>
        </div>
        <div className="recovery-bottom">
          <span>{restored ? 'Revert feedback queued' : 'Snapshot saved'}</span>
        </div>
      </div>
    </ProjectScene>
  );
}
