import { useEffect, useRef, useState } from 'react';
import example from '../../data/iodineExample.json';

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
  const code = phase === 'edited' ? example.after : example.restored;
  const [beforeChange, afterChange] = code.split('.trim()');
  return (
    <div className={reader ? 'iodine-story-example' : 'cinema-contribution'} data-phase={phase}>
      <div className="cinema-code-heading">
        <span>{example.file}</span>
        <span>{phase === 'edited' ? 'Agent edit' : 'File restored'}</span>
      </div>
      <pre>
        <code>
          {reader && afterChange !== undefined ? (
            <>
              {beforeChange}
              <mark>.trim()</mark>
              {afterChange}
            </>
          ) : (
            code
          )}
        </code>
      </pre>
      <div className="cinema-result" aria-live="polite">
        <strong>
          {phase === 'edited'
            ? reader
              ? 'Snapshot saved'
              : 'An edit, with a way back.'
            : reader
              ? 'Revert feedback queued'
              : 'Restored. The agent gets the message.'}
        </strong>
        <p>
          {phase === 'edited'
            ? 'A snapshot preserves the previous file contents.'
            : 'The file is back. Revert feedback tells the agent what changed.'}
        </p>
      </div>
      <div className="cinema-code-actions">
        <button
          type="button"
          className="cinema-undo"
          disabled={replaying}
          onClick={() => setPhase(phase === 'edited' ? 'restored' : 'edited')}
        >
          {phase === 'edited' ? 'Undo edit' : 'Replay edit'}
        </button>
        {reader ? (
          <span className="iodine-archive-label">Recorded example</span>
        ) : (
          <button type="button" aria-disabled={replaying} onClick={replay}>
            {replaying ? 'Playing example…' : 'Play recorded example'}
          </button>
        )}
      </div>
      {!reader && (
        <p className="cinema-example-note">
          Recorded file-restore example. No live agent is running.
        </p>
      )}
    </div>
  );
}
