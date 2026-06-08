import { type ReactNode } from 'react';
import { CARS } from '../config';
import { StatCounter, formatCompact } from './StatCounter';

const PANEL_BASE = 'panel pointer-events-auto max-w-[420px]';
const EYEBROW =
  'font-[var(--font-mono)] text-[0.66rem] tracking-[0.4em] text-[var(--color-muted)] uppercase';
const H2 =
  'mt-3 mb-3 text-[clamp(2.4rem,6.5vw,4rem)] leading-[0.92] font-semibold tracking-[-0.045em]';
const P_LI =
  'text-[clamp(0.95rem,1.3vw,1.05rem)] leading-[1.55] text-[rgba(244,240,255,0.78)]';
const UL_BASE = 'list-none p-0 mt-4 [&>li]:py-2.5 [&>li]:border-t [&>li]:border-white/[0.07] [&>li:last-child]:border-b [&>li:last-child]:border-white/[0.07]';

/** Compact stat callout used in the Work section header. */
function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[clamp(1.4rem,2.6vw,2rem)] leading-none font-semibold tracking-[-0.03em] text-[var(--color-fg)]">
        {value}
      </span>
      <span className="font-[var(--font-mono)] text-[0.6rem] tracking-[0.18em] uppercase text-[var(--color-muted)]">
        {label}
      </span>
    </div>
  );
}

function Section({ id, side, children }: { id: string; side: 'left' | 'right' | 'center'; children: ReactNode }) {
  const justify =
    side === 'left' ? 'justify-start' : side === 'right' ? 'justify-end' : 'justify-center';
  const text = side === 'center' ? 'text-center' : 'text-left';
  return (
    <section
      id={id}
      className={`min-h-screen flex items-center px-[5vw] pointer-events-none ${justify} ${text}`}
    >
      {children}
    </section>
  );
}

export function Sections() {
  return (
    <main id="scroll" className="relative z-10">
      <Section id="sec-intro" side="center">
        <div className="panel pointer-events-auto max-w-[860px] text-center px-4">
          <span className={EYEBROW}>Software · Interfaces · Motion</span>
          <h2 className="mt-4 mb-4 text-[clamp(3.2rem,10vw,7rem)] leading-[0.88] font-semibold tracking-[-0.055em]">
            Software engineer<br />
            <span className="text-[var(--color-neon)]">building</span> for the web.
          </h2>
          <p className={`${P_LI} max-w-[40ch] mx-auto`}>
            Scroll to look around. Click and drag to orbit the car.
          </p>
        </div>
      </Section>

      <Section id="sec-work" side="right">
        <div className={PANEL_BASE}>
          <span className={EYEBROW}>01 / WORK</span>
          <h2 className={H2}>Selected work</h2>
          <div className="mt-5 grid grid-cols-3 gap-4 border-y border-[var(--color-line)] py-4">
            <Stat value={<StatCounter to={240} format={formatCompact} suffix="+" />} label="Readers reached" />
            <Stat value={<StatCounter to={2500} suffix="+" />} label="Publisher newsletters" />
            <Stat value={<><StatCounter to={120} /><span className="text-[var(--color-muted)] mx-1">→</span><StatCounter to={1} /></>} label="API calls / load" />
          </div>
          <ul className={`${UL_BASE} ${P_LI}`}>
            <li>Helped move the platform&apos;s backend off a legacy monolith. Built a Django REST API and rewrote the UI in React.</li>
            <li>Built a Playwright testing framework that uses LLM agents to write E2E tests and fix them when they break.</li>
            <li>Cut the Line Item Details page&apos;s API calls down from 120 per load to one. Ops noticed.</li>
            <li>At Zeta, built Sponsorships, Audience Extension, and Blackout Periods. Data models, APIs, UIs.</li>
            <li>At LiveIntent, owned Creative Mapping v2 across the MySQL schema, the REST layer, and an Angular frontend.</li>
          </ul>
        </div>
      </Section>

      <Section id="sec-about" side="left">
        <div className={PANEL_BASE}>
          <span className={EYEBROW}>02 / ABOUT</span>
          <h2 className={H2}>What I do</h2>
          <ul className={`${UL_BASE} ${P_LI}`}>
            <li>Software engineer at Zeta Global in New York. Was at LiveIntent for two and a half years before that.</li>
            <li>Python and TypeScript are my daily drivers. Plenty of SQL too.</li>
            <li>Most of my work is in Django, React, Postgres, Docker, and AWS. Have shipped real things in Angular and FastAPI as well.</li>
            <li>Lately learning more about agentic AI for testing and LLM dev workflows. Also Three.js, which is how this site happened.</li>
          </ul>
        </div>
      </Section>

      <Section id="sec-resume" side="right">
        <div className={PANEL_BASE}>
          <span className={EYEBROW}>03 / RESUME</span>
          <h2 className={H2}>Experience</h2>
          <ul className={`${UL_BASE} ${P_LI}`}>
            <li>Software Engineer · Zeta Global · 2024–present</li>
            <li>Software Engineer · LiveIntent · 2023–2024</li>
            <li>Associate Software Engineer · LiveIntent · 2022–2023</li>
          </ul>
          <a
            href="/resume.pdf"
            className="
              inline-block mt-5 px-5 py-2.5 rounded-full
              border border-[var(--color-line)]
              font-[var(--font-mono)] text-[0.78rem] tracking-[0.22em] uppercase
              text-[var(--color-fg)] no-underline transition-colors
              hover:border-[var(--color-neon)] hover:text-[var(--color-neon)]
            "
          >
            Download PDF →
          </a>
        </div>
      </Section>

      <Section id="sec-contact" side="center">
        <div className={PANEL_BASE}>
          <span className={EYEBROW}>04 / CONTACT</span>
          <h2 className={H2}>Let&apos;s talk.</h2>
          <ul className={`list-none p-0 mt-4 ${P_LI}`}>
            <li className="py-1.5">
              <a className="text-[var(--color-fg)] no-underline border-b border-[var(--color-neon)] hover:text-[var(--color-neon)]" href="mailto:aidenwsj@gmail.com">
                aidenwsj@gmail.com
              </a>
            </li>
            <li className="py-1.5">
              <a className="text-[var(--color-fg)] no-underline border-b border-[var(--color-neon)] hover:text-[var(--color-neon)]" href="https://github.com/aiden-jang" target="_blank" rel="noopener">
                github.com/aiden-jang
              </a>
            </li>
            <li className="py-1.5">
              <a className="text-[var(--color-fg)] no-underline border-b border-[var(--color-neon)] hover:text-[var(--color-neon)]" href="https://linkedin.com/in/aidenjang" target="_blank" rel="noopener">
                linkedin.com/in/aidenjang
              </a>
            </li>
          </ul>
          <Credits />
        </div>
      </Section>
    </main>
  );
}

function Credits() {
  const credited = CARS.filter((c) => !!c.credit);
  if (credited.length === 0) return null;
  return (
    <div
      id="credit"
      aria-live="polite"
      className="
        mt-10 pt-5 border-t border-[var(--color-line)]
        font-[var(--font-mono)] text-[0.66rem] tracking-[0.16em] uppercase
        text-[var(--color-muted)] leading-[1.7] text-left
      "
    >
      <span className="block text-[var(--color-fg)] mb-1.5 tracking-[0.32em] text-[0.62rem]">
        Model Credits
      </span>
      <ul className="list-none p-0 m-0">
        {credited.map((c) => (
          <li key={c.name} className="py-1">
            {c.name} ·{' '}
            <a
              href={c.credit!.url}
              target="_blank"
              rel="noopener"
              className="text-inherit no-underline border-b border-transparent hover:text-[var(--color-fg)] hover:border-[var(--color-neon)]"
            >
              {c.credit!.author}
            </a>{' '}
            · {c.credit!.license}
          </li>
        ))}
      </ul>
    </div>
  );
}
