import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { CARS } from '../../config';
import { useAppStore } from '../../store';
import { Section } from './shared';

export function IntroSection() {
  const carIndex = useAppStore((state) => state.carIndex);
  const scrollToWork = () => {
    document.getElementById('sec-work')?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  };
  return (
    <Section id="sec-intro" side="left" desktopVertical="top" mobileVertical="top">
      <div className="panel garage-intro pointer-events-auto">
        <h1>Aiden Jang</h1>
        <p>
          Full-stack engineer.
          <br />
          Real-time products, web applications,
          <br />
          and the details between them.
        </p>
      </div>
      <div className="garage-index pointer-events-auto">
        <span>Look around</span>
        <a
          href="#sec-work"
          onClick={(event) => {
            event.preventDefault();
            scrollToWork();
          }}
        >
          Selected work <span>↓</span>
        </a>
        <a href="/Aiden_Jang_Resume.pdf" target="_blank" rel="noopener">
          Résumé <span>↗</span>
        </a>
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
