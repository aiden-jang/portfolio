import type { JSX } from 'react';

/** Each shipped app's real mark, inlined as SVG so the Work cards carry the
 *  actual product identity (same shapes + colors as the deployed apps) with no
 *  extra requests. Gradient ids are namespaced so several can render at once. */
export type MarkKey = 'owewell' | 'iguess' | 'wherever' | 'bloomnote' | 'auth';

/** A representative solid accent per app, used for the card's hover glow and
 *  keyline so the grid reads as a family of distinct products. */
export const ACCENTS: Record<MarkKey, string> = {
  owewell: '#a78bfa',
  iguess: '#a855f7',
  wherever: '#ff5e2c',
  bloomnote: '#ff8fa3',
  auth: '#22d3ee',
};

export const marks: Record<MarkKey, () => JSX.Element> = {
  owewell: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="mk-owewell" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#mk-owewell)" />
      <path
        d="M150 96 h212 v300 l-30 -20 -30 20 -30 -20 -30 20 -30 -20 -32 20 z"
        fill="#0a0a12"
        fillOpacity="0.92"
      />
      <g stroke="#a78bfa" strokeWidth="26" strokeLinecap="round">
        <line x1="196" y1="178" x2="316" y2="178" />
        <line x1="196" y1="238" x2="316" y2="238" />
        <line x1="196" y1="298" x2="282" y2="298" />
      </g>
    </svg>
  ),
  iguess: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="mk-iguess" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#818cf8" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#mk-iguess)" />
      <g fill="#0b0a12" transform="rotate(20 256 256)">
        <path d="M216 100 h80 v244 l-40 64 -40 -64 z" />
      </g>
    </svg>
  ),
  wherever: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="mk-wherever" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff5e2c" />
          <stop offset="0.5" stopColor="#ff2d78" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="112" fill="url(#mk-wherever)" />
      <path
        d="M150 176 L200 336 L256 214 L312 336 L362 176"
        fill="none"
        stroke="#f6f1e7"
        strokeWidth="36"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="386" cy="330" r="22" fill="#d7ff3e" />
    </svg>
  ),
  bloomnote: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7.5" fill="#1c1116" />
      <g transform="translate(1.8 2.3) scale(0.9)">
        <circle cx="16" cy="8" r="6" fill="#FF8FA3" />
        <circle cx="22.9" cy="12" r="6" fill="#FF8FA3" />
        <circle cx="22.9" cy="20" r="6" fill="#FF8FA3" />
        <circle cx="16" cy="24" r="6" fill="#FF8FA3" />
        <circle cx="9.1" cy="20" r="6" fill="#FF8FA3" />
        <circle cx="9.1" cy="12" r="6" fill="#FF8FA3" />
        <circle cx="16" cy="16" r="5" fill="#FFD700" />
        <circle cx="16" cy="16" r="2.5" fill="#FFA500" opacity="0.4" />
      </g>
    </svg>
  ),
  auth: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="mk-auth" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="120" fill="url(#mk-auth)" />
      <g transform="rotate(45 256 256)">
        <g fill="#09090f" fillOpacity="0.92">
          <circle cx="256" cy="152" r="80" />
          <rect x="240" y="210" width="32" height="200" rx="8" />
          <rect x="272" y="322" width="48" height="28" rx="6" />
          <rect x="272" y="368" width="34" height="26" rx="6" />
        </g>
        <circle cx="256" cy="152" r="34" fill="url(#mk-auth)" />
      </g>
    </svg>
  ),
};
