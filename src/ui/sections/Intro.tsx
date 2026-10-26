import { Section } from './shared';

export function IntroSection() {
  return (
    <Section id="sec-intro" side="left" desktopVertical="top" mobileVertical="top">
      <div className="panel garage-intro pointer-events-auto">
        <h1>Aiden Jang</h1>
        <p>
          Software engineer in New York.
          <br />
          I build tools for publishers,
          <br />
          and apps for notes, games and everyday decisions.
        </p>
      </div>
    </Section>
  );
}
import './intro.css';
