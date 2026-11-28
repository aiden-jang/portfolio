import example from '../../data/iodineExample.json';
import './undo-agent-context.css';

export function UndoAgentContext({
  restored,
  announce = false,
}: {
  restored: boolean;
  announce?: boolean;
}) {
  return (
    <div className="undo-agent-context" data-restored={restored}>
      <div className="undo-agent-label">
        <strong>Agent context</strong>
        {restored && <code>{example.feedback.type}</code>}
      </div>
      <div className="undo-agent-message" aria-live={announce ? 'polite' : 'off'}>
        <p className="undo-agent-waiting" hidden={restored}>
          Undo restores the saved line and tells the agent what changed.
        </p>
        <blockquote aria-hidden={!restored}>
          <p>{example.feedback.summary}</p>
          <p>{example.feedback.guidance}</p>
        </blockquote>
      </div>
    </div>
  );
}
