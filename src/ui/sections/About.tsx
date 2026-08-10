import { EYEBROW, H2, P_LI, Section } from './shared';

// Grouped so the toolbox reads as a quick scan, not a wall. Roles live in the
// Experience section and the side platform in Projects, so About stays focused
// on how I work + what I reach for (a different shape from Experience's list).
const SKILLS = ['TypeScript', 'Python', 'React', 'Django', 'Cloudflare'];

const PRINCIPLES = [
  {
    number: '01',
    title: 'Show what changed',
  },
  {
    number: '02',
    title: 'Use AI on purpose',
  },
  {
    number: '03',
    title: 'Do not turn care into homework',
  },
];

export function AboutSection() {
  return (
    <Section id="sec-about" side="left" desktopVertical="top">
      <div className="panel pointer-events-auto w-full max-w-[520px]">
        <span className={EYEBROW}>03 / ABOUT</span>
        <h2 className={H2}>How I work</h2>
        <p className={`${P_LI} max-w-[48ch]`}>
          I like shipping the whole thing, from data model to deployed UI, and sweating the parts
          nobody screenshots: real error states, server-side invariants, and copy that sounds like a
          person wrote it.
        </p>

        <div className="mt-6 flex flex-wrap gap-1.5">
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

        <div className="mt-5 border-t border-white/[0.1] pt-4">
          <p className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.2em] uppercase text-[var(--color-muted)]">
            Principles
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {PRINCIPLES.map((principle) => (
              <span
                key={principle.number}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] px-2.5 py-1.5 text-[0.72rem] text-[rgba(244,240,255,0.72)]"
              >
                <span className="font-[var(--font-mono)] text-[0.54rem] tracking-[0.1em] text-[var(--color-neon)]">
                  {principle.number}
                </span>
                {principle.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
