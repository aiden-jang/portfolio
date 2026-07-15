import { EYEBROW, H2, P_LI, PANEL_BASE, Section, UL_BASE } from './shared';

const BULLETS = [
  'Software engineer at Zeta Global, ~3 years. Previously LiveIntent.',
  'Python and TypeScript day-to-day. Plenty of SQL.',
  'Comfortable across Django, React, Postgres, AWS. Angular and FastAPI too.',
  'On the side: a $0 Cloudflare-native platform (SSO, realtime, AI) running several apps I built and ship.',
  'Lately: agentic AI testing, LLM dev workflows, Three.js.',
];

export function AboutSection() {
  return (
    <Section id="sec-about" side="left">
      <div className={PANEL_BASE}>
        <span className={EYEBROW}>02 / ABOUT</span>
        <h2 className={H2}>What I do</h2>
        <ul className={`${UL_BASE} ${P_LI}`}>
          {BULLETS.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
