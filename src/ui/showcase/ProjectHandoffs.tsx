import { useEffect, useRef } from 'react';
import { kamchatkaExample } from '../../data/kamchatkaExample';
import { lerp } from '../../math';
import { easedProgress } from '../../hooks/useScrollStudy';
import './project-handoffs.css';
import { dinnerPhoto } from './DinnerRating';

type Frame = { x: number; y: number; w: number; h: number };
type Cut = {
  id: 'quake' | 'receipt' | 'flower';
  source: string;
  destination: string;
  ready: string;
  start: number;
  end: number;
};

const cuts: Cut[] = [
  {
    id: 'quake',
    source: '.quake-journey-readings',
    destination: '#project-iodine .recovery-line',
    ready: '.quake-journey-run[data-depth-readings]:not([data-quake-manual])',
    start: 1.23,
    end: 0.57,
  },
  {
    id: 'receipt',
    source: '#project-wherever .dinner-ticket-photo',
    destination: '#project-worth .dinner-rating-photo',
    ready: '#project-wherever[data-dinner-state=bill]',
    start: 1.18,
    end: 0.46,
  },
  {
    id: 'flower',
    source: '#project-bloomnote [aria-pressed=true] .bloom-garden-plant',
    destination: '#project-iguess .iguess-draw-board',
    ready: '#project-bloomnote:not([data-composing=true])',
    start: 1.24,
    end: 0.52,
  },
];

function fit(element: HTMLElement, cut: Cut, from: boolean): Frame {
  const r = element.getBoundingClientRect();
  if (cut.id === 'flower') {
    if (from) return { x: r.left + r.width * 0.48, y: r.top + r.height * 0.54, w: 3, h: 37 };
    const k = Math.min(r.width / 960, r.height / 605);
    const x = r.left + (r.width - 960 * k) / 2 + 334 * k;
    const y = r.top + (r.height - 605 * k) / 2 + 137 * k;
    return { x, y, w: 9 * k, h: 46 * k };
  }
  if (!from && cut.id === 'quake') {
    return { x: r.left - 9, y: r.top - 8, w: r.width + 18, h: r.height + 16 };
  }
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

function artwork(el: HTMLElement, cut: Cut, target: HTMLElement, p: number) {
  el.style.setProperty('--pass', String(p));
  if (cut.id === 'quake') {
    const line = el.querySelector('.carried-code')!;
    const text = target.innerText.trim();
    el.style.setProperty('--code-type-size', getComputedStyle(target).fontSize);
    if (line.textContent !== text) line.textContent = text ?? '';
  }
}

export function ProjectHandoffs() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || typeof matchMedia !== 'function' || typeof IntersectionObserver !== 'function')
      return;
    const motion = matchMedia('(prefers-reduced-motion: no-preference)');
    const scenes = cuts.map((cut) => ({
      cut,
      item: host.querySelector<HTMLElement>('[data-carry=' + cut.id + ']')!,
      source: null as HTMLElement | null,
      target: null as HTMLElement | null,
      lastPosition: null as Frame | null,
    }));
    let frame = 0;

    function draw() {
      frame = 0;
      for (const scene of scenes) {
        const { cut, item } = scene;
        const target = document.querySelector<HTMLElement>(cut.destination);
        const source = document.querySelector<HTMLElement>(cut.source);
        if (!target || !source) {
          item.hidden = true;
          scene.source?.removeAttribute('data-carried-source');
          scene.target?.removeAttribute('data-carried-target');
          scene.source
            ?.closest<HTMLElement>('#project-wherever')
            ?.style.removeProperty('--dinner-paper-exit');
          scene.lastPosition = null;
          continue;
        }
        if (scene.source !== source) scene.source?.removeAttribute('data-carried-source');
        if (scene.target !== target) scene.target?.removeAttribute('data-carried-target');
        scene.source = source;
        scene.target = target;
        const end = fit(target, cut, false);
        const start = fit(source, cut, true);
        const height = innerHeight;
        const p = 1 - easedProgress(end.y / height, cut.end, cut.start);
        const isDinner = cut.id === 'receipt';
        const ready = document.querySelector(cut.ready);
        const sourceInFrame = start.y + start.h > 96 && start.y < height * 0.97;
        const targetReady =
          !(target instanceof HTMLImageElement) || (target.complete && target.naturalWidth > 0);
        if (p < 0.16) {
          if (ready && sourceInFrame && start.w > 0) scene.lastPosition = start;
          else if (end.y > height * (cut.start + 0.18)) scene.lastPosition = null;
        }
        const origin = scene.lastPosition;
        const floating =
          motion.matches && !!origin && ready && targetReady && p > 0.01 && p < 0.997;
        item.hidden = !floating;
        const dinnerCarried = isDinner && motion.matches && !!origin && !!ready && targetReady;
        const dinner = isDinner ? source.closest<HTMLElement>('#project-wherever') : null;
        dinner?.style.setProperty(
          '--dinner-paper-exit',
          String(dinnerCarried ? easedProgress(p, 0.21, 0.54) : 0),
        );
        source.toggleAttribute(
          'data-carried-source',
          (dinnerCarried && p > 0.01) || (!!floating && cut.id === 'quake'),
        );
        target.toggleAttribute(
          'data-carried-target',
          !!floating && (isDinner || (cut.id === 'quake' && p > 0.67)),
        );
        if (cut.id === 'quake') {
          target.toggleAttribute(
            'data-cut-landing',
            motion.matches && !!origin && p > 0.8 && end.y > -80,
          );
        }
        if (!floating || !origin) continue;
        const blend = easedProgress(p, 0.06, 0.99);
        const destinationY = isDinner ? height * cut.end : Math.min(end.y, height * 0.69);
        const depthStrip = cut.id === 'quake';
        const vertical = isDinner
          ? easedProgress(p, 0.36, 0.99)
          : depthStrip
            ? easedProgress(p, 0.28, 0.99)
            : blend;
        const stripHeight = depthStrip
          ? lerp(
              lerp(origin.h, 4, easedProgress(p, 0.04, 0.25)),
              end.h,
              easedProgress(p, 0.53, 0.94),
            )
          : lerp(origin.h, end.h, blend);
        const x = lerp(origin.x, end.x, blend);
        const sourceY = isDinner
          ? Math.max(height * 0.11, start.y)
          : origin.y + (depthStrip ? (origin.h - stripHeight) * 0.5 : 0);
        const y =
          lerp(sourceY, destinationY, vertical) +
          (isDinner ? (end.y - destinationY) * easedProgress(p, 0.85, 1) : 0);
        item.style.transform = `translate3d(${x}px,${y}px,0)`;
        item.style.width = lerp(origin.w, end.w, blend) + 'px';
        item.style.height = stripHeight + 'px';
        artwork(item, cut, target, p);
      }
      const dinner = document.getElementById('project-wherever');
      if (dinner) {
        const t = easedProgress(dinner.getBoundingClientRect().top / innerHeight, 0.25, 0.9);
        dinner.style.setProperty('--room-light-on-pizza', String(motion.matches ? t : 0));
      }
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const gallery = host.parentElement;
    const nearby = new Set<Element>();
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) nearby.add(entry.target);
          else nearby.delete(entry.target);
        }
        schedule();
      },
      { rootMargin: '100% 0px' },
    );
    const scroll = () => {
      if (nearby.size) schedule();
    };
    for (const id of [
      '#sec-work',
      '#project-bloomnote',
      '#project-iguess',
      '#project-wherever',
      '#project-worth',
    ]) {
      const section = gallery?.querySelector(id);
      if (section) watch.observe(section);
    }
    const entrance = new IntersectionObserver(schedule, { rootMargin: '120px 0px' });
    for (const cut of cuts) {
      const destination = document.querySelector(cut.destination);
      if (destination) entrance.observe(destination);
    }
    window.addEventListener('scroll', scroll, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      entrance.disconnect();
      watch.disconnect();
      window.removeEventListener('scroll', scroll);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
      for (const scene of scenes) {
        scene.source?.removeAttribute('data-carried-source');
        scene.target?.removeAttribute('data-carried-target');
        scene.target?.removeAttribute('data-cut-landing');
      }
    };
  }, []);

  return (
    <div ref={ref} className="project-handoffs-art" aria-hidden="true">
      <div data-carry="quake" hidden>
        <div className="carried-depth">
          <small>Kamchatka · M{kamchatkaExample.sources[0].magnitude}</small>
          <div className="carried-depth-values">
            {kamchatkaExample.sources.map(({ name, depthKm }) => (
              <span key={name}>
                <small>{name}</small>
                <b>
                  {depthKm.toFixed(1)} <em>km</em>
                </b>
              </span>
            ))}
          </div>
        </div>
        <code className="carried-code" />
      </div>
      <div data-carry="flower" hidden>
        <i />
      </div>
      <div data-carry="receipt" hidden>
        <img src={dinnerPhoto} decoding="async" alt="" />
      </div>
    </div>
  );
}
