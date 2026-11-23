import { useEffect, useRef, type ReactNode } from 'react';
import { easedProgress, useScrollStudy } from '../../hooks/useScrollStudy';
import './project-scene.css';

function presentScene(stage: HTMLElement, progress: number) {
  stage.style.setProperty('--scene-blend', easedProgress(progress, 0.27, 0.72).toFixed(3));
  stage.dataset.sceneProgress = progress.toFixed(3);
  stage.dispatchEvent(new CustomEvent('project-scene-progress', { detail: progress }));
}

type SceneFrame = { image: string; alt: string; anchor?: string };

export function ProjectScene({
  id,
  theme,
  title,
  links,
  children,
}: {
  id: string;
  theme: 'iodine' | 'iguess' | 'mrrp' | 'dinner';
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
          <div className="project-scene-links">{links}</div>
        </header>
        {children}
      </div>
    </article>
  );
}

export function ScrollScenes({ frames }: { frames: readonly [SceneFrame, SceneFrame] }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const stage = track.current;
    const section = stage?.closest('article');
    const body = stage?.parentElement;
    const second = frames[1].anchor;
    if (!stage || !section || !body) return;
    const animated = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 610px)');
    const seekSecond = () => {
      if (!second || location.hash !== '#' + second || !animated.matches) return;
      const top = window.scrollY + section.getBoundingClientRect().top;
      const inset = Number.parseFloat(getComputedStyle(body).top);
      const travel = section.offsetHeight - body.offsetHeight;
      window.scrollTo({ top: top - inset + travel * 0.85, behavior: 'instant' });
    };
    const initial = requestAnimationFrame(seekSecond);
    window.addEventListener('hashchange', seekSecond);
    return () => {
      cancelAnimationFrame(initial);
      window.removeEventListener('hashchange', seekSecond);
    };
  }, [frames]);

  return (
    <div className="project-scene-track" ref={track}>
      {frames.map(({ image, alt, anchor }) => (
        <div key={image} className="project-scene-still">
          {anchor && <span id={anchor} className="project-scene-anchor" />}
          <picture>
            <source media="(max-width: 700px)" srcSet={`/projects/scenes/${image}-mobile.webp`} />
            <img
              src={`/projects/scenes/${image}-desktop.webp`}
              alt={alt}
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      ))}
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
