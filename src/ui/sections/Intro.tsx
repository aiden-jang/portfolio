import { CARS } from '../../config';
import { useAppStore } from '../../store';
import { Section } from './shared';

export function IntroSection() {
  const carIndex = useAppStore((state) => state.carIndex);
  return (
    <Section id="sec-intro" side="left" desktopVertical="top" mobileVertical="top">
      <div className="panel garage-intro pointer-events-auto">
        <h1>Aiden Jang</h1>
        <p>
          Software engineer in New York.
          <br />
          I build publisher tools and playful apps,
          <br />
          from the interface to the API doing the actual work.
        </p>
      </div>
      <div className="garage-caption">
        <span>
          {String(carIndex + 1).padStart(2, '0')} / {CARS[carIndex].name} / {CARS[carIndex].code}
        </span>
        <br />
        Not my daily driver.
      </div>
    </Section>
  );
}
