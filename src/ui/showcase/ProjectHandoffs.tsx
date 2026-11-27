import { GardenLeafCut } from './GardenLeafCut';
import { useEffect, useRef } from 'react';
import { lerp } from '../../math';
import { easedProgress } from '../../hooks/useScrollStudy';
import './project-handoffs.css';
import { dinnerPhoto } from './DinnerRating';

type Frame = { x: number; y: number; w: number; h: number };
type Cut = {
  id: 'receipt';
  source: string;
  destination: string;
  ready: string;
  start: number;
  end: number;
};

const cuts: Cut[] = [
  {
    id: 'receipt',
    source: '#project-wherever .dinner-ticket-photo',
    destination: '#project-worth .dinner-rating-photo',
    ready: '#project-wherever[data-dinner-state=bill]',
    start: 1.18,
    end: 0.46,
  },
];

function fit(element: HTMLElement): Frame {
  const r = element.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
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
        const end = fit(target);
        const start = fit(source);
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
        source.toggleAttribute('data-carried-source', dinnerCarried && p > 0.01);
        target.toggleAttribute('data-carried-target', !!floating && isDinner);
        if (!floating || !origin) continue;
        const blend = easedProgress(p, 0.06, 0.99);
        const destinationY = isDinner ? height * cut.end : Math.min(end.y, height * 0.69);
        const vertical = isDinner ? easedProgress(p, 0.36, 0.99) : blend;
        const x = lerp(origin.x, end.x, blend);
        const sourceY = isDinner ? Math.max(height * 0.11, start.y) : origin.y;
        const y =
          lerp(sourceY, destinationY, vertical) +
          (isDinner ? (end.y - destinationY) * easedProgress(p, 0.85, 1) : 0);
        item.style.transform = `translate3d(${x}px,${y}px,0)`;
        item.style.width = lerp(origin.w, end.w, blend) + 'px';
        item.style.height = lerp(origin.h, end.h, blend) + 'px';
        item.style.setProperty('--pass', String(p));
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
      }
    };
  }, []);

  return (
    <div ref={ref} className="project-handoffs-art" aria-hidden="true">
      <GardenLeafCut />
      <div data-carry="receipt" hidden>
        <img src={dinnerPhoto} decoding="async" alt="" />
      </div>
    </div>
  );
}
