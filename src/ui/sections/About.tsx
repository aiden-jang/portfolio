import { EYEBROW, H2, P_LI, Section } from './shared';

// Grouped so the toolbox reads as a quick scan, not a wall. Roles live in the
// Experience section and the side platform in Projects, so About stays focused
// on how I work + what I reach for (a different shape from Experience's list).
const SKILLS = [
  'Python',
  'TypeScript',
  'SQL',
  'Django',
  'React',
  'Angular',
  'FastAPI',
  'PostgreSQL',
  'AWS',
  'Cloudflare',
];

const PRINCIPLES = [
  {
    number: '01',
    title: 'Make the state visible',
    body: 'A room should notice someone arriving. A decision should feel decided. The interface should show the change, not announce it.',
  },
  {
    number: '02',
    title: 'AI needs a real job',
    body: 'The model should make a game stranger, a gift more specific, or testing less brittle—not become a glowing button with no point.',
  },
  {
    number: '03',
    title: 'Care without obligation',
    body: 'No shame loops, no fake urgency. The best small products make room for people instead of asking them to maintain another thing.',
  },
];

export function AboutSection() {
  return (
    <Section id="sec-about" side="left">
      <div className="panel pointer-events-auto w-full max-w-[520px]">
        <span className={EYEBROW}>03 / ABOUT</span>
        <h2 className={H2}>How I work</h2>
        <p className={`${P_LI} max-w-[48ch]`}>
          I like shipping the whole thing, from data model to deployed UI, and sweating the parts
          nobody screenshots: real error states, server-side invariants, and copy that sounds like a
          person wrote it.
        </p>

        <p className="mt-5 mb-2 font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase text-[var(--color-muted)]">
          Toolbox
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SKILLS.map((s) => (
            <span
              key={s}
              className="
                px-2.5 py-1 rounded-full border border-[var(--color-line)]
                bg-white/[0.02] font-[var(--font-mono)] text-[0.68rem]
                tracking-[0.12em] uppercase text-[rgba(244,240,255,0.75)]
              "
            >
              {s}
            </span>
          ))}
        </div>

        <p className={`${P_LI} mt-5`}>
          <span className="text-[var(--color-muted)]">Lately:</span> agentic AI testing, LLM dev
          workflows, and Three.js.
        </p>

        <div className="mt-7 border-t border-white/[0.1] pt-5">
          <p className="font-[var(--font-mono)] text-[0.62rem] tracking-[0.24em] uppercase text-[var(--color-muted)]">
            Product instincts
          </p>
          <div className="mt-3 grid gap-2">
            {PRINCIPLES.map((principle) => (
              <article
                key={principle.number}
                className="group rounded-lg border border-white/[0.08] bg-white/[0.025] px-3.5 py-3 transition-colors duration-200 hover:border-[var(--color-neon)] hover:bg-white/[0.05]"
              >
                <div className="flex items-baseline gap-2.5">
                  <span className="font-[var(--font-mono)] text-[0.6rem] tracking-[0.14em] text-[var(--color-neon)]">
                    {principle.number}
                  </span>
                  <h3 className="text-[0.92rem] font-semibold tracking-[-0.015em] text-[var(--color-fg)]">
                    {principle.title}
                  </h3>
                </div>
                <p className="mt-1.5 pl-[1.85rem] text-[0.8rem] leading-[1.45] text-[rgba(244,240,255,0.62)]">
                  {principle.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
