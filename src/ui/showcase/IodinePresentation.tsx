import { useEffect, useRef, useState } from 'react';
import example from '../../data/iodineExample.json';
import { evidenceHref } from '../creative/storyRoutes';
import { ProjectScene } from './ProjectScene';

export function IodinePresentation() {
  const frame = useRef<HTMLDivElement>(null);
  const [restored, restore] = useState(false);
  const scrollPhase = useRef(false);
  useEffect(() => {
    const article = frame.current?.closest('article');
    if (!article) return;
    const sync = () => {
      const next = Number(article.dataset.sceneProgress ?? 0) >= 0.54;
      if (next !== scrollPhase.current) {
        scrollPhase.current = next;
        restore(next);
      }
    };
    sync();
    article.addEventListener('project-scene-progress', sync);
    return () => article.removeEventListener('project-scene-progress', sync);
  }, []);
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
          <span role="status">{restored ? 'File restored' : 'Agent edit'}</span>
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
          <button type="button" onClick={() => restore(!restored)}>
            {restored ? 'Replay edit' : 'Undo edit'}
          </button>
        </div>
      </div>
    </ProjectScene>
  );
}
