import { useEffect, useRef, type ReactNode } from 'react';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import './project-scene.css';

function presentScene(stage: HTMLElement, progress: number) {
  if (stage.id === 'project-wherever') {
    stage.style.setProperty('--paper', String(easedProgress(progress, 0.12, 0.53)));
    stage.style.setProperty('--tear', String(easedProgress(progress, 0.48, 0.88)));
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
  useScrollStudy(scene, true, presentScene);
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

export function DinnerScene() {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = track.current;
    const section = stage?.closest('article');
    const body = stage?.parentElement;
    if (!stage || !section || !body) return;
    const animated = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 610px)');
    const seekSecond = () => {
      if (location.hash !== '#project-owewell' || !animated.matches) return;
      const top = window.scrollY + section.getBoundingClientRect().top;
      const inset = Number.parseFloat(getComputedStyle(body).top);
      const travel = section.offsetHeight - body.offsetHeight;
      window.scrollTo({ top: top - inset + travel * 0.9, behavior: 'instant' });
    };
    const initial = requestAnimationFrame(seekSecond);
    window.addEventListener('hashchange', seekSecond);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener('hashchange', seekSecond);
    };
  }, []);

  return (
    <div className="dinner-sequence" ref={track}>
      <div className="dinner-photo">
        <div className="dinner-result">
          <small>Alex &amp; Maya’s pick</small>
          <strong>
            Neighborhood
            <br />
            Pizza Kitchen
          </strong>
        </div>
      </div>
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
