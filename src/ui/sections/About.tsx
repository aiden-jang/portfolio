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
            <p className="about-lead">
              I make the next step easier, from recovering an edit to picking dinner.
            </p>
            <div className="about-profile">
              <dl className="about-details">
                <div>
                  <dt>Background</dt>
                  <dd>Computer Engineering at Rutgers</dd>
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
