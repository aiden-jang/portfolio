import { Section } from './shared';
import './about.css';
import { AboutFraming } from './AboutFraming';
import { AboutReel } from './AboutReel';

export function AboutSection() {
  return (
    <Section id="sec-about" side="left" desktopVertical="top" mobileVertical="top">
      <div className="about-copy pointer-events-auto">
        <h2>About</h2>
        <div className="about-reel-story">
          <AboutReel />
          <div className="about-story">
            <p className="about-lead">Most of my side projects start with something ordinary.</p>
            <div className="about-profile">
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
        <AboutFraming />
      </div>
    </Section>
  );
}
