import { useEffect, useRef, type ReactNode } from 'react';
import './project-scene.css';

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
  return (
    <article id={id} className={`project-scene project-scene-${theme}`}>
      <div className="project-scene-body">
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
    let frame = 0;
    let listening = false;

    const paint = () => {
      frame = 0;
      const travel = section.offsetHeight - body.offsetHeight;
      const inset = Number.parseFloat(getComputedStyle(body).top);
      const position = (inset - section.getBoundingClientRect().top) / travel;
      const progress = Math.max(0, Math.min(1, (position - 0.27) / 0.45));
      const blend = progress ** 2 * (3 - 2 * progress);
      if (Number.isFinite(blend)) stage.style.setProperty('--scene-blend', blend.toFixed(3));
    };
    const schedule = () => {
      if (listening && animated.matches && !frame) frame = requestAnimationFrame(paint);
    };
    const seekSecond = () => {
      if (!second || location.hash !== '#' + second || !animated.matches) return;
      const top = window.scrollY + section.getBoundingClientRect().top;
      const inset = Number.parseFloat(getComputedStyle(body).top);
      const travel = section.offsetHeight - body.offsetHeight;
      window.scrollTo({ top: top - inset + travel * 0.85, behavior: 'instant' });
    };
    const initial = requestAnimationFrame(seekSecond);
    window.addEventListener('hashchange', seekSecond);
    const visibility = new IntersectionObserver(([entry]) => {
      listening = !!entry?.isIntersecting;
      schedule();
    });
    visibility.observe(section);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    animated.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(initial);
      window.removeEventListener('hashchange', seekSecond);
      visibility.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      animated.removeEventListener('change', schedule);
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
