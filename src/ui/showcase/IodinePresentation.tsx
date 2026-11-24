import { useCallback, useContext, useEffect, useRef, useState, type Ref } from 'react';
import example from '../../data/iodineExample.json';
import { evidenceHref } from '../creative/storyRoutes';
import { useTimedScene } from '../../hooks/useTimedScene';
import './iodine-timed.css';
import { ProjectScene } from './ProjectScene';
import { OpenIodine } from './iodine-session';
import { ControlIcon } from '../ControlIcon';

export function IodinePresentation() {
  const frame = useRef<HTMLDivElement>(null);
  const holdForReturn = useRef(false);
  const openCase = useContext(OpenIodine);
  const [restored, restore] = useState(false);
  const draw = useCallback((progress: number) => {
    const editor = frame.current;
    if (!editor || holdForReturn.current) return;
    const phase = progress === 0 ? 'ready' : progress < 0.56 ? 'reviewing' : 'restored';
    if (editor.dataset.playback === phase) return;
    editor.dataset.playback = phase;
    restore(phase === 'restored');
  }, []);
  useTimedScene(frame, draw, { duration: 1720, hold: 1320 });
  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && node.getClientRects().length) holdForReturn.current = false;
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const href = evidenceHref('iodine', {
    edit: restored ? 'restored' : 'edited',
  });
  return (
    <ProjectScene
      id="project-iodine"
      theme="iodine"
      title={
        <a
          className="iodine-case-link"
          aria-label="Read the iodine case study"
          href={href}
          onClick={(event) => {
            if (openCase?.(event, restored)) holdForReturn.current = true;
          }}
        >
          iodine <ControlIcon name="arrow" />
        </a>
      }
      links={null}
    >
      <RecoveryEditor restored={restored} frame={frame} />
    </ProjectScene>
  );
}

export function RecoveryEditor({
  restored,
  frame,
  inspectable = false,
}: {
  restored: boolean;
  frame?: Ref<HTMLDivElement>;
  inspectable?: boolean;
}) {
  const source = useRef<HTMLDivElement>(null);
  const [first, second, last] = example.after.trimEnd().split('\n');
  const [start, end] = second!.trim().split('.trim()');
  return (
    <div className="recovery" ref={frame} data-restored={restored}>
      <div className="recovery-meta">
        {inspectable ? (
          <button type="button" onClick={() => source.current?.focus()}>
            <code>{example.file}:2</code>
          </button>
        ) : (
          <code>{example.file}:2</code>
        )}
        <span role="status" aria-live="off">
          {restored ? 'Edit undone' : 'Agent edit'}
        </span>
      </div>
      <div className="recovery-source" ref={source} tabIndex={inspectable ? -1 : undefined}>
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
        <span>{restored ? 'Original line restored' : 'Snapshot saved'}</span>
      </div>
    </div>
  );
}
