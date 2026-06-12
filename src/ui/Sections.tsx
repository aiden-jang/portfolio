import { useState, type ReactNode } from 'react';
import { CARS } from '../config';
import { WorkModal, type WorkDetail } from './WorkModal';

const PANEL_BASE = 'panel pointer-events-auto max-w-[420px]';
const EYEBROW =
  'font-[var(--font-mono)] text-[0.66rem] tracking-[0.4em] text-[var(--color-muted)] uppercase';
const H2 =
  'mt-3 mb-2.5 text-[clamp(1.8rem,4vw,2.6rem)] leading-[0.98] font-semibold tracking-[-0.03em]';
const P_LI =
  'text-[clamp(0.95rem,1.3vw,1.05rem)] leading-[1.55] text-[rgba(244,240,255,0.78)]';
const UL_BASE = 'list-none p-0 mt-4 [&>li]:py-2.5 [&>li]:border-t [&>li]:border-white/[0.07] [&>li:last-child]:border-b [&>li:last-child]:border-white/[0.07]';

const WORK_ITEMS: WorkDetail[] = [
  {
    title: 'Blossom',
    context: 'Side project · 2025',
    summary: 'A side project of mine. Click to learn more and try it.',
    body: [
      'A web app I built on the side. Full-stack: data model, API, UI, all of it.',
      'Live at blossom.aidenjang.com — give it a spin.',
    ],
    stack: ['TypeScript', 'React', 'Node.js'],
    link: { label: 'Visit Blossom', url: 'https://blossom.aidenjang.com' },
  },
  {
    title: 'Monolith → Django REST + React rewrite',
    context: 'Zeta Global · 2024–present',
    summary: 'Migrated the platform off a legacy monolith. Django REST + React rewrite.',
    body: [
      'Co-led a platform-wide migration from a legacy PHP monolith to a Django REST API. The new system powers self-service native ad onboarding across 2,500+ publisher newsletters reaching ~240M readers.',
      'Owned both ends: data modeling and Django serializers on the backend, React + TypeScript components and hooks on the frontend. Shipped continuously alongside the existing system, with feature flags routing traffic to the new stack.',
    ],
    stack: ['Django', 'Python', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Agentic AI Playwright framework',
    context: 'Zeta Global',
    summary: 'Playwright framework where LLM agents write and self-heal E2E tests.',
    body: [
      'Three-stage pipeline — Planner, Generator, Healer. The Planner reads a feature spec and decomposes it into test scenarios. The Generator turns each scenario into a runnable Playwright spec. The Healer watches for flakes and rewrites selectors / waits when DOM changes shift the page out from under existing tests.',
      'Established baseline frontend E2E coverage across the platform without burning weeks on hand-rolled fixtures.',
    ],
    stack: ['Playwright', 'TypeScript', 'Claude API', 'Node.js'],
  },
  {
    title: 'Line Item Details: 120 → 1 API call',
    context: 'Zeta Global',
    summary: 'Cut a key admin page from 120 API calls per load down to one.',
    body: [
      "The page used a per-row component pattern that issued one API call per visible row — dozens of round-trips before the page even rendered. Consolidated everything into a single batched endpoint with the joined data the page actually needs.",
      'Load time went from "go get coffee" to instant. The internal ops and sales teams who used it daily said thanks in #engineering.',
    ],
    stack: ['Django', 'REST', 'React', 'TypeScript', 'PostgreSQL'],
  },
  {
    title: 'Sponsorships, Audience Extension, Blackout Periods',
    context: 'Zeta Global',
    summary: 'Three publisher-config tools at Zeta. Data models, APIs, UIs.',
    body: [
      'Sponsorships v1.0 — Creatives + Demand Controls. Publisher monetization configuration across media groups, sensitive categories, and RTB exchange settings.',
      'Audience Extension — campaign scheduling with bulk DMA / zip-code audience targeting.',
      'Blackout Periods — time-window controls that suppress specific creatives or exchanges. Owned data models, Django REST APIs, and React/TypeScript UIs for all three.',
    ],
    stack: ['Django', 'REST', 'PostgreSQL', 'React', 'TypeScript'],
  },
  {
    title: 'Creative Mapping v2',
    context: 'LiveIntent · 2023–2024',
    summary: 'Owned Creative Mapping v2 across MySQL, REST, and Angular.',
    body: [
      'Creative-to-placement targeting for the ad-serving XML pipeline. Designed the MySQL schema for the new mapping model, built the REST API on the legacy backend, and delivered the Angular UI for publisher ops to configure targeting rules.',
      'Shipped alongside a stack of related work: third-party demand controls for RTB native + hybrid slots, five publisher data migrations, and resolution of a critical search-endpoint performance regression.',
    ],
    stack: ['MySQL', 'PHP', 'REST', 'Angular', 'TypeScript', 'XML'],
  },
];

/** Editorial-row item used in the Work section. Clicking opens the full
 *  case-study modal. Borders + bg appear only on hover, matching the
 *  paragraph-style rhythm of the other sections. */
function WorkRow({ item, onOpen }: { item: WorkDetail; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="
        group w-full text-left block py-2.5
        border-y border-transparent rounded-md -mx-2 px-2
        transition-colors duration-200
        hover:border-[var(--color-line)] hover:bg-white/[0.02]
      "
    >
      <p className="text-[rgba(244,240,255,0.82)] text-[clamp(0.95rem,1.25vw,1.02rem)] leading-[1.55] m-0 transition-colors group-hover:text-[var(--color-fg)]">
        {item.link && (
          <span
            className="
              inline-flex items-center gap-1 mr-2 px-2 py-0.5 rounded-full align-[1px]
              font-[var(--font-mono)] text-[0.6rem] tracking-[0.18em] uppercase
              text-[var(--color-neon)] bg-[rgba(255,107,28,0.1)]
              border border-[rgba(255,107,28,0.4)]
            "
          >
            <span className="inline-block w-1 h-1 rounded-full bg-[var(--color-neon)] animate-pulse" />
            Live
          </span>
        )}
        {item.summary}
      </p>
    </button>
  );
}

function Section({ id, side, children }: { id: string; side: 'left' | 'right' | 'center'; children: ReactNode }) {
  // On desktop, panels alternate left/right/center per the design. On mobile
  // we force center + add vertical padding so the panel sits clear of the
  // Brand block (top) and the section-dots / hint strip (bottom).
  const desktopJustify =
    side === 'left' ? 'md:justify-start' : side === 'right' ? 'md:justify-end' : 'md:justify-center';
  const desktopText = side === 'center' ? 'md:text-center' : 'md:text-left';
  return (
    <section
      id={id}
      className={`
        min-h-screen flex items-center pointer-events-none
        px-[6vw] md:px-[5vw]
        pt-[22vh] pb-[22vh] md:py-0
        justify-center text-center
        ${desktopJustify} ${desktopText}
      `}
    >
      {children}
    </section>
  );
}

export function Sections() {
  const [activeWork, setActiveWork] = useState<WorkDetail | null>(null);
  return (
    <main id="scroll" className="relative z-10">
      <Section id="sec-intro" side="center">
        <div className="panel pointer-events-auto max-w-[640px] text-center px-4">
          <span className={EYEBROW}>Software · Interfaces · Motion</span>
          <h2 className="mt-3 mb-3 text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
            Software engineer building for the web.
          </h2>
          <p className={`${P_LI} max-w-[40ch] mx-auto`}>
            Scroll to look around. Click and drag to orbit the car.
          </p>
        </div>
      </Section>

      <Section id="sec-work" side="right">
        <div className="panel pointer-events-auto max-w-[500px]">
          <span className={EYEBROW}>01 / WORK</span>
          <h2 className={H2}>Selected work</h2>
          <div className="mt-4">
            {WORK_ITEMS.map((item, i) => (
              <WorkRow
                key={i}
                item={item}
                onOpen={() => setActiveWork(item)}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section id="sec-about" side="left">
        <div className={PANEL_BASE}>
          <span className={EYEBROW}>02 / ABOUT</span>
          <h2 className={H2}>What I do</h2>
          <ul className={`${UL_BASE} ${P_LI}`}>
            <li>Software engineer at Zeta Global. Previously LiveIntent, ~2.5 years.</li>
            <li>Python and TypeScript day-to-day. Plenty of SQL.</li>
            <li>Comfortable across Django, React, Postgres, AWS. Angular and FastAPI too.</li>
            <li>Lately: agentic AI testing, LLM dev workflows, Three.js.</li>
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
      <WorkModal item={activeWork} onClose={() => setActiveWork(null)} />
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
