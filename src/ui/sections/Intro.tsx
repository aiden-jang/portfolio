import { Section } from './shared';

export function IntroSection() {
  return (
    <Section id="sec-intro" side="left" desktopVertical="top" mobileVertical="top">
      <div className="panel garage-intro pointer-events-auto">
        <h1>Aiden Jang</h1>
        <p className="intro-role">Software engineer in New York.</p>
        <p>I build tools for publishers, and apps for notes, games and everyday decisions.</p>
      </div>
    </Section>
  );
}
import './intro.css';
