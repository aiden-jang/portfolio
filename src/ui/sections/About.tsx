import { EYEBROW, H2, P_LI, Section } from './shared';

const SKILLS = ['TypeScript', 'Python', 'React', 'Django', 'Cloudflare'];

export function AboutSection() {
  return (
    <Section id="sec-about" side="left" desktopVertical="top">
      <div className="panel pointer-events-auto w-full max-w-[520px]">
        <span className={EYEBROW}>03 / ABOUT</span>
        <h2 className={H2}>The whole thing.</h2>
        <p className={`${P_LI} max-w-[48ch]`}>
          At Zeta Global, I build publisher tools from the data model through the interface. Before
          that, I worked at LiveIntent. A lot of my work is making a complicated system easier to
          use.
        </p>
        <p className={`${P_LI} mt-4 max-w-[48ch]`}>
          My side projects are smaller: picking dinner, splitting a bill, sending someone a garden.
          Same attention to the details. Considerably more cats.
        </p>
        <div className="mt-6 border-t border-[var(--color-line)] pt-4">
          <p className="font-[var(--font-mono)] text-[0.58rem] tracking-[0.2em] uppercase text-[var(--color-muted)]">
            A small decision I care about
          </p>
          <p className={`${P_LI} mt-2 max-w-[48ch]`}>
            mrrp has no streaks or read receipts. The cat can’t be neglected. Keeping someone
            company shouldn’t come with a performance review.
          </p>
        </div>
        <div
          className="mt-6 flex flex-wrap gap-2 font-[var(--font-mono)] text-[0.65rem] text-[var(--color-muted)]"
          aria-label="Tools I work with"
        >
          {SKILLS.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </div>
      </div>
    </Section>
  );
}
