const CONTRIBUTIONS = [
  {
    label: 'Command approvals',
    title: 'Allow this. Not everything.',
    detail: 'Scoped rules, command normalization and revocable approvals.',
    commit: '5347f8a4',
  },
  {
    label: 'Local embeddings',
    title: 'Similar. Within limits.',
    detail:
      'Local embeddings suggest and match similar commands within approved signatures and paths.',
    commit: '77c4ead5',
  },
  {
    label: 'Agent edit undo',
    title: 'Actually, put it back.',
    detail: 'File snapshots, a revert action and feedback to the agent when an edit is undone.',
    commit: '6afaf7a8',
  },
];

export function IodineContributions() {
  return (
    <div className="contribution-panel">
      <div className="contribution-heading">
        <span>Open source · Contributor</span>
        <a href="https://github.com/hyunwookshin/iodine" target="_blank" rel="noopener noreferrer">
          Upstream repository ↗
        </a>
      </div>
      <div className="contribution-grid">
        {CONTRIBUTIONS.map((item, index) => (
          <a
            key={item.commit}
            href={`https://github.com/hyunwookshin/iodine/commit/${item.commit}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`See ${item.label.toLowerCase()} contribution`}
          >
            <span className="contribution-number">0{index + 1} ↗</span>
            <span className="contribution-label">{item.label}</span>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
