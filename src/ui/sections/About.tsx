import { EYEBROW, H2, P_LI, Section } from './shared';

export function AboutSection() {
  return (
    <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
      <div className="about-copy panel pointer-events-auto w-full max-w-[560px] text-left">
        <span className={EYEBROW}>03 / ABOUT</span>
        <h2 className={H2}>A bit about me.</h2>
        <div data-nosnippet>
          <p className={`${P_LI} max-w-[48ch]`}>
            At Zeta Global, I work on publisher tools: scheduling ads, managing demand and
            onboarding newsletters. Before that, I worked at LiveIntent. I work across the database,
            API and interface, and help other engineers build on those systems.
          </p>
        </div>
        <p className={`${P_LI} mt-4 max-w-[48ch]`}>
          Outside work, the projects tend to start with something ordinary: where to eat, whether a
          drink was worth another go, what to write to someone. Those became wherever, worth and
          bloomnote. Then came mrrp, a room for two people and a pixel cat. The cat does not
          appreciate the infrastructure.
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
                aria-describedby="external-link-hint"
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
