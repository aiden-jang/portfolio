import React from 'react';

const paths: Record<string, React.ReactNode> = {
  arrow: (
    <>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </>
  ),
  external: (
    <>
      <path d="M6 18 18 6M7 6h11v11" />
    </>
  ),
  back: (
    <>
      <path d="M20 12H5m6 7-7-7 7-7" />
    </>
  ),
  undo: (
    <>
      <path d="m8 4-5 5 5 5M4 9h10a6 6 0 0 1 0 12h-3" />
    </>
  ),
  pencil: (
    <>
      <path d="m3 20 2-6L16 3a2 2 0 0 1 3 0l2 2a2 2 0 0 1 0 3L10 19l-7 1Zm11-15 5 5M5 14l5 5" />
    </>
  ),
  mouse: (
    <>
      <path d="M7 13c-2-8 7-9 7-3 3-.1 5 2.1 7 5-3.3 3.9-9.5 4.5-13.7 2.2C4.2 15.5 3.5 13.2 3.8 11 4.3 8 1.9 7.6 1.2 9" />
      <circle cx="16.2" cy="13.4" r=".8" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
    </>
  ),
  moon: <path d="M19.5 15.2A8.6 8.6 0 0 1 8.8 4.5a8.4 8.4 0 1 0 10.7 10.7Z" />,

  tick: <path d="m4.5 12 5 5 10-10" />,
};
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}
