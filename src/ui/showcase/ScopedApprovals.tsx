import evidence from './approval-decisions.json';

export function ScopedApprovals() {
  const { rule, inside, outside } = evidence;
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
      <div className="scope-cases">
        <div data-decision={inside.decision}>
          <code>
            <span>{rule.program}</span> <mark>{inside.target}</mark>
          </code>
          <strong>Approval reused</strong>
          <p>Same command. The path is inside the approved folder.</p>
        </div>
        <div data-decision={outside.decision}>
          <code>
            <span>{rule.program}</span> <mark>{outside.target}</mark>
          </code>
          <strong>Fresh approval needed</strong>
          <p>Same command. The path falls outside the approved folder.</p>
        </div>
      </div>
    </section>
  );
}
