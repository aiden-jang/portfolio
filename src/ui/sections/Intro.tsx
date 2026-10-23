import { CARS, GARAGE_INDICES } from '../../config';
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
          I build tools for publishers,
          <br />
          and apps for notes, games and everyday decisions.
        </p>
      </div>
      <div className="garage-caption">
        <span>
          {GARAGE_INDICES.includes(carIndex)
            ? String(GARAGE_INDICES.indexOf(carIndex) + 1).padStart(2, '0')
            : 'Archive'}{' '}
          / {CARS[carIndex].name} / {CARS[carIndex].code}
        </span>
        <br />
        Not my daily driver.
      </div>
    </Section>
  );
}
