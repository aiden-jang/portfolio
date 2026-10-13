import { EYEBROW, H2, P_LI, Section } from './shared';

export function AboutSection() {
  return (
    <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
      <div className="about-copy panel pointer-events-auto w-full max-w-[560px] text-left">
        <span className={EYEBROW}>03 / ABOUT</span>
        <h2 className={H2}>Big systems. Small comforts.</h2>
        <p className={`${P_LI} max-w-[48ch]`}>
          I’m Aiden, a software engineer in New York. At Zeta Global, I build the tools publishers
          use to schedule ads, manage demand, and run their newsletters. Before that, I worked at
          LiveIntent.
        </p>
        <p className={`${P_LI} mt-4 max-w-[48ch]`}>
          Outside work, I build things for the smaller parts of a day: choosing dinner, remembering
          a good drink, leaving someone a note. Those became wherever, worth, and bloomnote. Then I
          made a room for two people and a pixel cat. The cat does not appreciate the
          infrastructure.
        </p>
        <dl className="about-details">
          <div>
            <dt>Background</dt>
            <dd>Computer Engineering · Rutgers</dd>
          </div>
          <div>
            <dt>Day to day</dt>
            <dd>Python, TypeScript, Django, React</dd>
          </div>
          <div>
            <dt>Open source</dt>
            <dd>
              <a
                href="https://github.com/aiden-jang/iodine"
                target="_blank"
                rel="noopener noreferrer"
              >
                iodine · agent approvals and undo ↗
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
