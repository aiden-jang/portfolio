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
      </div>
    </Section>
  );
}
