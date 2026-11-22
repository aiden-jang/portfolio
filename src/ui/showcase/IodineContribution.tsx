import { useContext, useEffect, useRef, useState } from 'react';
import example from '../../data/iodineExample.json';
import { IodineSession, type IodinePhase } from './iodine-session';
import './iodine-feedback.css';

function RestoredFeedback({ onFile }: { onFile?: () => void }) {
  const [beforePath, afterPath] = example.feedback.summary.split(example.file);
  return (
    <div className="iodine-feedback" aria-live="polite">
      <div>
        <code>{example.feedback.type}</code>
        <strong>Feedback sent to the agent</strong>
      </div>
      <blockquote>
        {onFile && (
          <p>
            {beforePath}
            <button type="button" className="iodine-line-link" onClick={onFile}>
              {example.file}
            </button>
            {afterPath}
          </p>
        )}
        {example.feedback.guidance}
      </blockquote>
      <a href={example.source} target="_blank" rel="noopener noreferrer">
        View snapshot and revert code
      </a>
    </div>
  );
}

const editedLines = example.after.trimEnd().split('\n');
const originalLines = example.before.trimEnd().split('\n');

function CodePanel({
  label,
  content,
  current,
}: {
  label: string;
  content: string;
  current: boolean;
}) {
  return (
    <div className="iodine-code-panel" data-current={current}>
      <div className="iodine-code-label">{label}</div>
      <pre>
        <code>
          {content
            .trimEnd()
            .split('\n')
            .map((line, index) => (
              <span
                key={index}
                className="iodine-code-line"
                data-line={index + 1}
                data-changed={editedLines[index] !== originalLines[index]}
              >
                {line}
                {'\n'}
              </span>
            ))}
        </code>
      </pre>
    </div>
  );
}

export function IodineContribution({
  reader = false,
  sourceLast = false,
}: { reader?: boolean; sourceLast?: boolean } = {}) {
  const session = useContext(IodineSession);
  const [localPhase, setLocalPhase] = useState<IodinePhase>('edited');
  const phase = session?.phase ?? localPhase;
  const setPhase = session?.setPhase ?? setLocalPhase;
  const activeLine = useRef<HTMLSpanElement>(null);
  const [replaying, setReplaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  const replay = () => {
    if (replaying) return;
    clearTimeout(timer.current);
    setPhase('edited');
    setReplaying(true);
    timer.current = setTimeout(() => {
      setPhase('restored');
      setReplaying(false);
    }, 2400);
  };

  const restored = phase === 'restored';
  const revealLine = () => {
    activeLine.current?.focus({ preventScroll: true });
    activeLine.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  };
  const undo = (
    <button
      type="button"
      className="cinema-undo"
      disabled={replaying}
      onClick={() => setPhase(restored ? 'edited' : 'restored')}
    >
      {restored ? 'Replay edit' : 'Undo edit'}
    </button>
  );

  if (reader) {
    const lines = (restored ? example.restored : example.after).trimEnd().split('\n');
    const [beforeEdit, afterEdit] = lines[1].split('.trim()');
    const source = (
      <p className="iodine-example-source">
        Recorded example file.{' '}
        <a
          href={example.source + '#L92-L107'}
          target="_blank"
          rel="noopener"
          aria-describedby="external-link-hint"
        >
          View Iodine’s restore code <span aria-hidden="true">↗</span>
        </a>
      </p>
    );
    return (
      <div className="iodine-story-example" data-phase={phase}>
        <div className="cinema-code-heading">
          <button type="button" className="iodine-line-link" onClick={revealLine}>
            {example.file}:2
          </button>
          <span>{restored ? 'File restored' : 'Agent edit'}</span>
        </div>
        <pre>
          <code>
            {lines.map((line, i) =>
              i === 1 ? (
                <span key={i} className="iodine-evidence-line" tabIndex={-1} ref={activeLine}>
                  <span aria-hidden="true">2</span>
                  {restored ? (
                    line
                  ) : (
                    <>
                      {beforeEdit}
                      <mark>.trim()</mark>
                      {afterEdit}
                    </>
                  )}
                  {'\n'}
                </span>
              ) : (
                <span key={i}>
                  {line}
                  {'\n'}
                </span>
              ),
            )}
          </code>
        </pre>
        <div className="cinema-code-actions">
          {undo}
          <span className="iodine-archive-label">Recorded example</span>
        </div>
        {!sourceLast && source}
        <div className="cinema-result" aria-live="polite">
          <strong>{restored ? 'Revert feedback queued' : 'Snapshot saved'}</strong>
          <p>
            {restored
              ? 'The file is back. Revert feedback tells the agent what changed.'
              : 'A snapshot preserves the previous file contents.'}
          </p>
        </div>
        {restored && <RestoredFeedback onFile={revealLine} />}
        {sourceLast && source}
      </div>
    );
  }

  return (
    <div className="cinema-contribution" data-phase={phase}>
      <div className="cinema-code-heading">
        <span>{example.file}</span>
        <span>Recorded file restore</span>
      </div>
      <div className="iodine-diff">
        <CodePanel label="Agent edit" content={example.after} current={!restored} />
        <CodePanel
          label={restored ? 'Restored file' : 'Saved snapshot'}
          content={restored ? example.restored : example.before}
          current={restored}
        />
      </div>
      <div className="iodine-editor-footer">
        <div className="cinema-result" aria-live="polite">
          <strong>{restored ? 'Snapshot restored' : 'Snapshot saved'}</strong>
          <p>
            {restored
              ? 'The original file is back and the agent receives feedback.'
              : 'Undo brings back the previous file and tells the agent what changed.'}
          </p>
        </div>
        <div className="cinema-code-actions">
          {undo}
          <button type="button" aria-disabled={replaying} onClick={replay}>
            {replaying ? 'Playing example…' : 'Play recorded example'}
          </button>
        </div>
      </div>
      {restored && <RestoredFeedback />}
    </div>
  );
}
