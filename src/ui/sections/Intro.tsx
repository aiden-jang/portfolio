import { EYEBROW, P_LI, Section } from './shared';

export function IntroSection() {
  return (
    <Section id="sec-intro" side="center">
      <div className="relative max-w-[640px] px-4">
        {/* Soft radial scrim: the hero text sits directly over the (often
            bright) car, where the panel's text-shadow alone isn't enough. This
            darkens just behind the copy and fades out before the car's edges,
            so legibility improves without hiding the focal point. */}
        <div className="hero-scrim" aria-hidden="true" />
        <div className="panel pointer-events-auto text-center relative z-[1]">
          <span className={EYEBROW}>Aiden Jang · Software Engineer</span>
          <h2 className="mt-3 mb-3 text-[clamp(2.4rem,5vw,3.6rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
            I build full-stack web apps, end to end.
          </h2>
          <p className={`${P_LI} max-w-[46ch] mx-auto`}>
            Django, React, and TypeScript in production at Zeta and LiveIntent, plus a set of
            Cloudflare-native side projects I actually ship.
          </p>
          <p className={`${P_LI} mt-3 max-w-[40ch] mx-auto opacity-70`}>
            <span className="md:hidden">Swipe to explore.</span>
            <span className="hidden md:inline">
              Scroll to look around. Click and drag to orbit the car.
            </span>
          </p>
        </div>
      </div>
    </Section>
  );
}
