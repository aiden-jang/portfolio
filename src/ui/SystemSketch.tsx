import type { EngineeringStepArt } from '../data/projectStories';

export function SystemSketch({ kind }: { kind: EngineeringStepArt }) {
  return (
    <svg className="system-sketch" viewBox="0 0 96 64" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {kind === 'browser' && (
          <>
            <rect x="13" y="9" width="70" height="47" rx="3" />
            <path d="M13 21h70M20 15h2m5 0h2m5 0h39" />
            <rect x="24" y="30" width="24" height="16" rx="2" />
            <path d="M56 33h16m-16 7h11" />
          </>
        )}
        {kind === 'worker' && (
          <>
            <path d="m48 7 32 15-32 15-32-15Zm-32 27 32 15 32-15M16 46l32 15 32-15" />
            <path d="m39 18-6 4 6 4m18-8 6 4-6 4m-11-8-4 8" />
          </>
        )}
        {kind === 'accounts' && (
          <>
            <ellipse cx="58" cy="19" rx="23" ry="8" />
            <path d="M35 19v28c0 11 46 11 46 0V19M35 33c0 11 46 11 46 0" />
            <circle cx="24" cy="28" r="9" />
            <path d="M24 37v19h6v-6h6v-6H24" />
          </>
        )}
        {kind === 'feeds' && (
          <>
            <rect x="12" y="9" width="30" height="19" rx="2" />
            <rect x="12" y="37" width="30" height="19" rx="2" />
            <path d="M18 17h18m-18 29h18M48 18h12l14 14m-26 15h12l14-15m-5 0h13m-4-4 4 4-4 4" />
          </>
        )}
        {kind === 'records' && (
          <>
            <rect x="16" y="8" width="34" height="43" rx="3" />
            <rect x="46" y="16" width="34" height="43" rx="3" />
            <path d="M23 19h19m-19 8h14m-14 8h14m17-8h18m-18 8h13m-13 8h17" />
          </>
        )}
        {kind === 'globe' && (
          <>
            <circle cx="40" cy="30" r="23" />
            <ellipse cx="40" cy="30" rx="10" ry="23" />
            <path d="M17 30h46M21 17h38M21 43h32" />
            <rect x="54" y="38" width="31" height="18" rx="3" />
            <path d="m61 43-4 4 4 4m17-8 4 4-4 4m-11-8-3 8" />
          </>
        )}
      </g>
    </svg>
  );
}
