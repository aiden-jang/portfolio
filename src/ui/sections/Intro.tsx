import { P_LI, Section } from './shared';

export function IntroSection() {
  return (
    <Section id="sec-intro" side="center">
      <div className="panel pointer-events-auto max-w-[640px] px-4 text-center">
        <h2 className="mb-3 text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
          I build web apps people want to use.
        </h2>
        <p className={`${P_LI} max-w-[46ch] mx-auto`}>
          I&apos;m a full-stack engineer who likes real-time products, thoughtful interactions, and
          making useful things with a little personality.
        </p>
        <p className={`${P_LI} mt-3 max-w-[40ch] mx-auto opacity-70`}>
          <span className="md:hidden">Swipe to explore.</span>
          <span className="hidden md:inline">
            Scroll to look around. Click and drag to orbit the car.
          </span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2.5">
          <a
            href="#sec-work"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-neon)] bg-[var(--color-neon)]/10 px-4 py-2.5 font-[var(--font-mono)] text-[0.62rem] tracking-[0.16em] uppercase text-[var(--color-fg)] no-underline transition-colors hover:bg-[var(--color-neon)]/20"
          >
            See projects <span aria-hidden="true">↓</span>
          </a>
          <a
            href="#sec-contact"
            className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] px-4 py-2.5 font-[var(--font-mono)] text-[0.62rem] tracking-[0.16em] uppercase text-[var(--color-muted)] no-underline transition-colors hover:border-white/[0.35] hover:text-[var(--color-fg)]"
          >
            Say hello <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </Section>
  );
}
