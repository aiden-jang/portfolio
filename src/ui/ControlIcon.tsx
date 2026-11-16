const paths = {
  arrow: 'M4 12h15m-5-5 5 5-5 5',
  chevron: 'm9 6 6 6-6 6',
  check: 'm5 12 4 4L19 6',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  zoom: 'm16 16 5 5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0M7 10h6m-3-3v6',
  fit: 'M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5',
  close: 'm6 6 12 12M18 6 6 18',
  share: 'M12 16V3m-4 4 4-4 4 4M6 11H4v10h16V11h-2',
  reset: 'M4 10a8 8 0 1 1 1 8M4 4v6h6',
  wing: 'M4 9h16M5 15h14M6 9l2 6m10-6-2 6',
  headlights: 'M13 7a5 5 0 0 0 0 10V7Zm4 1h4m-4 4h4m-4 4h4',
};

export function ControlIcon({ name, className }: { name: keyof typeof paths; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
