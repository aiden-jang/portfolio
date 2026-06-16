import { EYEBROW, P_LI, Section } from './shared';

export function IntroSection() {
  return (
    <Section id="sec-intro" side="center">
      <div className="panel pointer-events-auto max-w-[640px] text-center px-4">
        <span className={EYEBROW}>Software · Interfaces · Motion</span>
        <h2 className="mt-3 mb-3 text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
          Software engineer building for the web.
        </h2>
        <p className={`${P_LI} max-w-[40ch] mx-auto`}>
          <span className="md:hidden">Swipe to explore.</span>
          <span className="hidden md:inline">
            Scroll to look around. Click and drag to orbit the car.
          </span>
        </p>
      </div>
    </Section>
  );
}
