import { Section } from './shared';
import './about.css';

export function AboutSection() {
  return (
    <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
      <div className="about-copy pointer-events-auto">
        <h2>About</h2>
        <div className="about-grid">
          <div className="about-story">
            <p className="about-lead">Most of my side projects start with something ordinary.</p>
            <p className="about-body">
              Picking dinner with friends became <strong>wherever</strong>. A note for someone
              became <strong>bloomnote</strong>. Then there’s <strong>mrrp</strong>, a room for two
              and a pixel cat.
            </p>
          </div>
          <div>
            <figure className="about-garden">
              <img
                src="/projects/bloomnote-garden.jpg"
                alt="Three flowers from a bloomnote garden"
                width="980"
                height="820"
                loading="lazy"
              />
              <figcaption>A garden from bloomnote</figcaption>
            </figure>
            <dl className="about-details">
              <div>
                <dt>Background</dt>
                <dd>Computer Engineering at Rutgers</dd>
              </div>
              <div>
                <dt>Open source</dt>
                <dd>
                  <a
                    href="https://github.com/hyunwookshin/iodine/commits/main/?author=aiden-jang"
                    target="_blank"
                    aria-describedby="external-link-hint"
                    rel="noopener noreferrer"
                    className="about-contribution-link"
                  >
                    iodine <span aria-hidden="true">↗</span>
                  </a>
                  <p>
                    Scoped terminal approvals, agent edit recovery, and clickable file paths in
                    agent replies.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Section>
  );
}
