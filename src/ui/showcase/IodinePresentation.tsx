import { useCallback, useContext, useRef, useState, type Ref } from 'react';
import example from '../../data/iodineExample.json';
import { evidenceHref } from '../creative/storyRoutes';
import { useTimedScene } from '../../hooks/useTimedScene';
import './iodine-timed.css';
import { ProjectScene } from './ProjectScene';
import { OpenEvidence } from '../creative/evidenceNavigation';
import { ControlIcon } from '../ControlIcon';

export function IodinePresentation() {
  const frame = useRef<HTMLDivElement>(null);
  const openCase = useContext(OpenEvidence);
  const [restored, restore] = useState(false);
  const [manual, setManual] = useState(false);
  const draw = useCallback((progress: number) => {
    restore(progress >= 1);
  }, []);
  useTimedScene(frame, draw, {
    enabled: !manual,
    duration: 900,
    hold: 1450,
    startThreshold: 0.4,
  });

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
          onClick={(event) => openCase?.(event, 'iodine')}
        >
          iodine <ControlIcon name="arrow" />
        </a>
      }
      links={null}
    >
      <div className="iodine-scene-content">
        <RecoveryEditor
          restored={restored}
          frame={frame}
          onToggleEdit={() => {
            setManual(true);
            restore(!restored);
          }}
        />
      </div>
    </ProjectScene>
  );
}

export function RecoveryEditor({
  restored,
  frame,
  inspectable = false,
  onToggleEdit,
}: {
  restored: boolean;
  frame?: Ref<HTMLDivElement>;
  inspectable?: boolean;
  onToggleEdit?: () => void;
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
        {inspectable && <span>{restored ? 'Original line restored' : 'Snapshot saved'}</span>}
        {onToggleEdit && (
          <button type="button" onClick={onToggleEdit}>
            {restored ? 'Reset edit' : 'Undo edit'}
          </button>
        )}
      </div>
    </div>
  );
}
