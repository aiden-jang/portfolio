import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import { shortPhoneQuery, useScrollArrival } from '../../hooks/scrollArrival';
import { useTimedScene } from '../../hooks/useTimedScene';
import './project-scene.css';
import './dinner-scene.css';

const isShortDinner = () => matchMedia(shortPhoneQuery).matches;

type DinnerStep = { progress: number; focus?: string };

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
  }
  const match = easedProgress(progress, 0.24, 0.43);
  stage.toggleAttribute('data-dinner-before-match', match === 0);
  stage.toggleAttribute('data-dinner-after-vote', match === 1);
  stage.style.setProperty('--tear', String(easedProgress(progress, 0.48, 0.88)));
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
  const [actionFocused, setActionFocused] = useState(false);
  const draw = useCallback((progress: number) => {
    if (!scene.current || manualFrame.current) return;
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
        !matchMedia('(height < 610px)').matches &&
        !isShortDinner()
      ) {
        fastForward(0.47, 1200);
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
      const { progress, focus } = (event as CustomEvent<DinnerStep>).detail;
      const from = Number(stage.dataset.sceneProgress) || 0;
      const target = Math.max(manual.current, from, progress);
      const finish = () => {
        manualFrame.current = 0;
        manual.current = target;
        presentScene(stage, target);
        if (focus) stage.querySelector<HTMLElement>(focus)?.focus({ preventScroll: true });
      };
      cancelAnimationFrame(manualFrame.current);
      if (!focus || preference.matches || from === target) {
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

function DinnerTicket() {
  const choose = (event: React.MouseEvent<HTMLButtonElement>, phase: number) => {
    const stage = event.currentTarget.closest('article');
    stage?.dispatchEvent(
      new CustomEvent<DinnerStep>('dinner-preview-step', {
        detail: {
          progress: phase,
          focus: phase === 1 ? '.dinner-title-bill a' : '.dinner-split',
        },
      }),
    );
  };
  return (
    <div className="dinner-ticket">
      <img
        className="dinner-ticket-photo"
        src="/projects/scenes/wherever-pizza.jpg"
        alt=""
        loading="lazy"
        decoding="async"
      />
      <div className="dinner-receipt" id="project-owewell">
        <div className="dinner-ticket-paper paper">
          <div className="dinner-ticket-state">
            <span className="dinner-ticket-vote">Pick your dinner</span>
            <span className="dinner-ticket-match">Tonight’s plan</span>
          </div>
          <strong>Neighborhood Pizza Kitchen</strong>
          <div className="dinner-ticket-decisions">
            <div className="dinner-ticket-vote dinner-ticket-actions">
              <button type="button" onClick={(event) => choose(event, 0.47)}>
                Vote yes
              </button>
            </div>
            <div className="dinner-ticket-match dinner-ticket-count">
              <span>
                Alex <b>✓</b>
              </span>
              <span>
                Maya <b>✓</b>
              </span>
              <button className="dinner-split" type="button" onClick={(event) => choose(event, 1)}>
                Split $48
              </button>
            </div>
            <div className="dinner-total" aria-hidden="true">
              <small>Dinner for two</small>
              <strong>$48.00</strong>
            </div>
          </div>
        </div>
        <div className="stubs dinner-stubs" aria-hidden="true">
          <div className="paper stub">
            <small>Your share</small>
            <strong>$24.00</strong>
          </div>
          <div className="paper stub due">
            <small>Alex owes you</small>
            <strong>$24.00</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DinnerScene() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = track.current;
    const section = stage?.closest('article');
    const body = stage?.parentElement;
    if (!stage || !section || !body) return;
    const animated = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 610px)');
    const seekSecond = () => {
      if (location.hash !== '#project-owewell') return;
      section.dispatchEvent(
        new CustomEvent<DinnerStep>('dinner-preview-step', {
          detail: { progress: 1 },
        }),
      );
      if (!animated.matches || isShortDinner()) {
        stage
          .querySelector('#project-owewell')
          ?.scrollIntoView({ block: 'center', behavior: 'instant' });
        return;
      }
      const top = window.scrollY + section.getBoundingClientRect().top;
      const inset = Number.parseFloat(getComputedStyle(body).top);
      const travel = section.offsetHeight - body.offsetHeight;
      window.scrollTo({ top: top - inset + travel * 0.9, behavior: 'instant' });
    };
    let frame = 0;
    let active = true;
    const queueSeek = () => {
      cancelAnimationFrame(frame);
      // Reload can restore the old scroll offset after the first layout.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(seekSecond);
      });
    };
    const restoreLink = (event: PageTransitionEvent) => {
      if (!event.persisted) queueSeek();
    };
    queueSeek();
    void document.fonts?.ready.then(() => {
      if (active) queueSeek();
    });
    addEventListener('pageshow', restoreLink);
    addEventListener('hashchange', queueSeek);
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      removeEventListener('pageshow', restoreLink);
      removeEventListener('hashchange', queueSeek);
    };
  }, []);

  return (
    <div className="dinner-sequence" ref={track}>
      <DinnerTicket />
      <div className="dinner-exit-shade" aria-hidden="true" />
    </div>
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
