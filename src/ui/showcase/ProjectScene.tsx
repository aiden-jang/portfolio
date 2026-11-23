import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import './project-scene.css';
import './dinner-scene.css';

function settleDinner(progress: number) {
  if (progress < 0.24) return 0;
  if (progress < 0.55) return 0.47;
  return 1;
}

function presentScene(stage: HTMLElement, progress: number) {
  if (stage.id === 'project-wherever') {
    stage.dataset.dinnerState = progress >= 0.56 ? 'bill' : progress >= 0.32 ? 'match' : 'vote';
    stage.style.setProperty('--tear', String(easedProgress(progress, 0.48, 0.88)));
    stage.style.setProperty('--vote-swipe', String(easedProgress(progress, 0.09, 0.31)));
    stage.style.setProperty('--vote-match', String(easedProgress(progress, 0.24, 0.43)));
    stage.style.setProperty('--bill-arrival', String(easedProgress(progress, 0.55, 0.9)));
  }
  stage.dataset.sceneProgress = progress.toFixed(3);
  stage.dispatchEvent(new CustomEvent('project-scene-progress', { detail: progress }));
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
  const manual = useRef<{ y: number; phase: number } | null>(null);
  const draw = useCallback((stage: HTMLElement, progress: number) => {
    const pick = manual.current;
    if (pick && Math.abs(scrollY - pick.y) > 26) manual.current = null;
    presentScene(stage, manual.current?.phase ?? progress);
  }, []);
  useScrollStudy(scene, theme === 'dinner', draw, settleDinner);
  useEffect(() => {
    const stage = scene.current;
    if (!stage || theme !== 'dinner') return;
    const select = (event: Event) => {
      const phase = (event as CustomEvent<number>).detail;
      manual.current = { y: scrollY, phase };
      presentScene(stage, phase);
    };
    stage.addEventListener('dinner-preview-step', select);
    return () => stage.removeEventListener('dinner-preview-step', select);
  }, [theme]);
  return (
    <article ref={scene} id={id} className={`project-scene project-scene-${theme}`}>
      <div className="project-scene-body" data-study-pin>
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
    stage?.dispatchEvent(new CustomEvent('dinner-preview-step', { detail: phase }));
    const target = stage?.querySelector<HTMLButtonElement>(
      phase === 1 ? '.dinner-replay' : '.dinner-split',
    );
    target?.focus({ preventScroll: true });
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
      <div className="dinner-ticket-paper">
        <div className="dinner-ticket-state">
          <span className="dinner-ticket-vote">Pick your dinner</span>
          <span className="dinner-ticket-match">Tonight’s plan</span>
        </div>
        <strong>Neighborhood Pizza Kitchen</strong>
        <div className="dinner-ticket-decisions">
          <div className="dinner-ticket-vote dinner-ticket-actions">
            <span>Nope</span>
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
      if (!animated.matches) {
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
      <div className="bill" id="project-owewell">
        <div className="paper total">
          <span>Neighborhood Pizza Kitchen</span>
          <small>Dinner for two</small>
          <strong>$48.00</strong>
        </div>
        <div className="stubs">
          <div className="paper stub">
            <small>Your share</small>
            <strong>$24.00</strong>
          </div>
          <div className="paper stub due">
            <small>Alex owes you</small>
            <strong>$24.00</strong>
          </div>
        </div>
        <button
          type="button"
          className="dinner-replay"
          onClick={(event) => {
            const stage = event.currentTarget.closest('article');
            stage?.dispatchEvent(new CustomEvent('dinner-preview-step', { detail: 0 }));
            stage
              ?.querySelector<HTMLButtonElement>('.dinner-ticket-actions button')
              ?.focus({ preventScroll: true });
          }}
        >
          Replay dinner
        </button>
      </div>
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
