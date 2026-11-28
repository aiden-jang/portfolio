import { useCallback, useContext, useRef, useState, type Ref } from 'react';
import example from '../../data/iodineExample.json';
import { evidenceHref } from '../creative/storyRoutes';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { useTimedScene } from '../../hooks/useTimedScene';
import './iodine-timed.css';
import './playable-iodine.css';
import './night-engineering.css';
import { OpenEvidence } from '../creative/evidenceNavigation';
import { ControlIcon } from '../ControlIcon';
import { UndoAgentContext } from './UndoAgentContext';

const [first, editedLine, last] = example.after.trimEnd().split('\n');
const [prefix, suffix] = editedLine.split('name.trim()');

export function IodinePresentation() {
  const stage = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const openCase = useContext(OpenEvidence);
  const [restored, restore] = useState(false);
  const [manual, setManual] = useState(false);
  const draw = useCallback((progress: number) => {
    restore(progress >= 1);
  }, []);
  const seek = useTimedScene(frame, draw, {
    enabled: !manual,
    duration: 1900,
    hold: 2150,
    startThreshold: 0.4,
  });
  const arrive = useCallback(
    (fast: boolean) => {
      if (fast) seek(0.64, 240);
    },
    [seek],
  );
  useScrollArrival(stage, !manual, arrive, frame);

  const href = evidenceHref('iodine', {
    edit: restored ? 'restored' : 'edited',
  });
  return (
    <article
      id="project-iodine"
      className="portfolio-undo"
      aria-labelledby="iodine-proof-heading"
      ref={stage}
    >
      <div className="undo-sheet" data-study-pin>
        <header className="undo-heading">
          <h3 id="iodine-proof-heading">
            iodine
            <span className="editor-caret" aria-hidden="true" />
          </h3>
          <a
            href={href}
            onClick={(event) => {
              if (openCase?.(event, 'iodine')) setManual(true);
            }}
          >
            <span>My open-source contributions</span> <ControlIcon name="arrow" />
          </a>
        </header>
        <div className="recovery undo-buffer" ref={frame} data-restored={restored}>
          <div className="undo-file">
            <code>{example.file}</code>
            <span role="status" aria-live={manual ? 'polite' : 'off'}>
              {restored ? 'Edit undone' : 'Agent edit'}
            </span>
          </div>
          <div className="undo-lines">
            <pre className="sr-only">
              <code>{restored ? example.restored : example.after}</code>
            </pre>
            <div className="undo-row" data-line="1" aria-hidden="true">
              <code>{first}</code>
            </div>
            <div className="undo-row recovery-line" data-line="2" aria-hidden="true">
              <code>
                {prefix}
                <span className="undo-expression">
                  <span className="undo-kept-name">name</span>
                  <span className="undo-token">
                    <mark>.trim()</mark>
                  </span>
                </span>
                {suffix}
              </code>
            </div>
            <div className="undo-row" data-line="3" aria-hidden="true">
              <code>{last}</code>
            </div>
          </div>
          <div className="undo-actions">
            <button
              type="button"
              data-action={restored ? 'reset' : 'undo'}
              onClick={() => {
                setManual(true);
                restore((wasRestored) => !wasRestored);
              }}
            >
              {restored ? (
                <ControlIcon name="reset" />
              ) : (
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m9 4.5-5 5 5 5M4.5 9.5H14a5 5 0 0 1 0 10H9" />
                </svg>
              )}
              {restored ? 'Reapply edit' : 'Undo edit'}
            </button>
            <p className="undo-file-result">
              {restored ? 'Original line restored' : 'Snapshot saved'}
            </p>
          </div>
          <UndoAgentContext restored={restored} announce={manual} />
        </div>
      </div>
    </article>
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
  const [start, end] = editedLine.trim().split('.trim()');
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
