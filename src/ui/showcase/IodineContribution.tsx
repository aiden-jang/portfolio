import { useEffect, useRef, useState } from 'react';
import example from '../../data/iodineExample.json';

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

export function IodineContribution({ reader = false }: { reader?: boolean } = {}) {
  const [phase, setPhase] = useState<'edited' | 'restored'>('edited');
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
    const [beforeChange, afterChange] = example.after.split('.trim()');
    return (
      <div className="iodine-story-example" data-phase={phase}>
        <div className="cinema-code-heading">
          <span>{example.file}</span>
          <span>{restored ? 'File restored' : 'Agent edit'}</span>
        </div>
        <pre>
          <code>
            {restored ? (
              example.restored
            ) : (
              <>
                {beforeChange}
                <mark>.trim()</mark>
                {afterChange}
              </>
            )}
          </code>
        </pre>
        <div className="cinema-result" aria-live="polite">
          <strong>{restored ? 'Revert feedback queued' : 'Snapshot saved'}</strong>
          <p>
            {restored
              ? 'The file is back. Revert feedback tells the agent what changed.'
              : 'A snapshot preserves the previous file contents.'}
          </p>
        </div>
        <div className="cinema-code-actions">
          {undo}
          <span className="iodine-archive-label">Recorded example</span>
        </div>
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
    </div>
  );
}
