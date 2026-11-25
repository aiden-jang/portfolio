import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import { useScrollArrival } from '../../hooks/scrollArrival';
import { useTimedScene } from '../../hooks/useTimedScene';
import './project-scene.css';
import type { DinnerStep } from './DinnerScene';

function presentScene(stage: HTMLElement, progress: number) {
  const phase = progress >= 0.56 ? 'bill' : progress >= 0.32 ? 'match' : 'vote';
  if (stage.dataset.dinnerState !== phase) {
    stage.dataset.dinnerState = phase;
    stage
      .querySelector('.dinner-ticket-actions button')
      ?.toggleAttribute('inert', phase !== 'vote');
    stage.querySelector('.dinner-split')?.toggleAttribute('inert', phase !== 'match');
    stage.querySelector('.dinner-total')?.setAttribute('aria-hidden', String(phase !== 'bill'));
    stage.querySelector('.dinner-stubs')?.setAttribute('aria-hidden', String(phase !== 'bill'));
    stage.querySelector('.dinner-case')?.toggleAttribute('hidden', phase !== 'bill');
  }
  const match = easedProgress(progress, 0.24, 0.43);
  stage.toggleAttribute('data-dinner-before-match', match === 0);
  stage.toggleAttribute('data-dinner-after-vote', match === 1);
  stage.style.setProperty('--tear', String(easedProgress(progress, 0.48, 0.88)));
  stage.style.setProperty('--vote-swipe', String(easedProgress(progress, 0.09, 0.31)));
  stage.style.setProperty('--vote-match', String(match));
  stage.style.setProperty('--bill-arrival', String(easedProgress(progress, 0.55, 0.9)));
  stage.dataset.sceneProgress = progress.toFixed(3);
}

export function ProjectScene({
  id,
  theme,
  title,
  links,
  children,
}: {
  id: string;
  theme: 'iodine' | 'dinner';
  title: ReactNode;
  links: ReactNode;
  children: ReactNode;
}) {
  const scene = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const manual = useRef(0);
  const manualFrame = useRef(0);
  const gesture = useRef(false);
  const [actionFocused, setActionFocused] = useState(false);
  const draw = useCallback((progress: number) => {
    if (!scene.current || manualFrame.current || gesture.current) return;
    const compact = matchMedia('(height < 610px)').matches;
    presentScene(scene.current, compact ? 1 : Math.max(manual.current, progress));
  }, []);
  const fastForward = useTimedScene(body, draw, {
    enabled: theme === 'dinner' && !actionFocused,
    duration: 3400,
    startThreshold: 0.12,
    restartAfterExit: true,
  });
  const landing = useCallback(
    (active: boolean) => {
      if (
        active &&
        !manualFrame.current &&
        !gesture.current &&
        !matchMedia('(height < 610px)').matches
      ) {
        fastForward(1, 0);
      }
    },
    [fastForward],
  );
  useScrollArrival(scene, theme === 'dinner', landing);
  useEffect(() => {
    const stage = scene.current;
    if (!stage || theme !== 'dinner') return;
    const preference = matchMedia('(prefers-reduced-motion: reduce), (height < 610px)');
    const settle = () => {
      if (!preference.matches) return;
      cancelAnimationFrame(manualFrame.current);
      manualFrame.current = 0;
      presentScene(stage, 1);
    };
    const select = (event: Event) => {
      const { progress, focus, animate, reset } = (event as CustomEvent<DinnerStep>).detail;
      if (reset && !preference.matches) {
        cancelAnimationFrame(manualFrame.current);
        manualFrame.current = 0;
        manual.current = 0;
        gesture.current = true;
        presentScene(stage, 0);
        return;
      }
      const from = Number(stage.dataset.sceneProgress) || 0;
      const target = Math.max(manual.current, from, progress);
      const finish = () => {
        manualFrame.current = 0;
        manual.current = target;
        presentScene(stage, target);
        if (focus) stage.querySelector<HTMLElement>(focus)?.focus({ preventScroll: true });
      };
      cancelAnimationFrame(manualFrame.current);
      if ((!focus && !animate) || preference.matches || from === target) {
        finish();
        return;
      }
      const start = performance.now();
      const interpolate = (now: number) => {
        const mix = easedProgress(now - start, 0, target === 1 ? 650 : 300);
        if (mix === 1) finish();
        else {
          presentScene(stage, from + (target - from) * mix);
          manualFrame.current = requestAnimationFrame(interpolate);
        }
      };
      manualFrame.current = requestAnimationFrame(interpolate);
    };
    settle();
    preference.addEventListener('change', settle);
    stage.addEventListener('dinner-preview-step', select);
    return () => {
      cancelAnimationFrame(manualFrame.current);
      manualFrame.current = 0;
      preference.removeEventListener('change', settle);
      stage.removeEventListener('dinner-preview-step', select);
    };
  }, [theme]);
  return (
    <article ref={scene} id={id} className={`project-scene project-scene-${theme}`}>
      <div
        className="project-scene-body"
        ref={body}
        data-study-pin
        onFocus={(event) => setActionFocused(!!event.target.closest('.dinner-ticket button'))}
        onBlur={(event) => {
          if (!(
            event.relatedTarget instanceof Element &&
            event.relatedTarget.closest('.dinner-ticket button')
          ))
            setActionFocused(false);
        }}
      >
        <header className="project-scene-heading">
          <h3>{title}</h3>
          {links && <div className="project-scene-links">{links}</div>}
        </header>
        {children}
      </div>
    </article>
  );
}

export function SceneAppLink({
  href,
  name,
  children,
}: {
  href: string;
  name: string;
  children?: ReactNode;
}) {
  return (
    <a
      href={href}
      aria-label={`Open app: ${name}`}
      aria-describedby="external-link-hint"
      target="_blank"
      rel="noopener"
    >
      {children ?? 'Open app'} <span aria-hidden="true">↗</span>
    </a>
  );
}
