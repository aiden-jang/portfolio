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

export function AboutSection() {
  return (
    <Section id="sec-about" side="left">
      <div className="panel pointer-events-auto w-full max-w-[520px]">
        <span className={EYEBROW}>03 / ABOUT</span>
        <h2 className={H2}>How I work</h2>
        <p className={`${P_LI} max-w-[48ch]`}>
          I like shipping the whole thing, from data model to deployed UI, and sweating the parts
          nobody screenshots: real error states, server-side invariants, and copy that sounds like
          a person wrote it.
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
      </div>
    </Section>
  );
}
