import { Section } from './shared';

export function IntroSection() {
  return (
    <Section id="sec-intro" side="left" desktopVertical="top" mobileVertical="top">
      <div className="panel garage-intro pointer-events-auto">
        <h1>Aiden Jang</h1>
        <p className="intro-role">
          Building publisher tools at Zeta. Making useful things after hours.
        </p>
        <p>I build tools for publishers, and apps for notes, games and everyday decisions.</p>
        <a href="#sec-work" className="intro-work-cue">
          Selected work
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4v16m-5-5 5 5 5-5" />
          </svg>
        </a>
      </div>
    </Section>
  );
}
import './intro.css';
