import { useState } from 'react';
import evidence from './approval-decisions.json';
import './scoped-approvals.css';

export function ScopedApprovals() {
  const { rule, inside, outside } = evidence;
  const [folder, setFolder] = useState<'inside' | 'outside'>('inside');
  const allowed = folder === 'inside';
  const choice = allowed ? inside : outside;
  return (
    <section className="scope-study" aria-labelledby="scope-title">
      <header>
        <div>
          <h4 id="scope-title">What an approval covers</h4>
          <p>
            One grant for <code>{rule.program}</code> inside <code>{rule.target}/</code> and its
            subfolders.
          </p>
        </div>
        <span>Recorded decisions</span>
      </header>
      <div className="scope-toggle" role="group" aria-label="Choose command working folder">
        <button type="button" aria-pressed={allowed} onClick={() => setFolder('inside')}>
          Inside scope
        </button>
        <button type="button" aria-pressed={!allowed} onClick={() => setFolder('outside')}>
          Outside scope
        </button>
      </div>
      <div className="scope-cases scope-cases-single" aria-live="polite" aria-atomic="true">
        <div data-decision={choice.decision}>
          <code>
            <span>{rule.program}</span> <mark>{choice.target}</mark>
          </code>
          <strong>{allowed ? 'Approval reused' : 'Fresh approval needed'}</strong>
          <p>
            {allowed
              ? 'The path is inside the approved folder.'
              : 'The path falls outside the approved folder.'}
          </p>
        </div>
      </div>
    </section>
  );
}
