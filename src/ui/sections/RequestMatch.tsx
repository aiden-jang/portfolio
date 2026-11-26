import { useEffect, useRef } from 'react';
import { easedProgress } from '../../hooks/useScrollStudy';
import './request-match.css';

export function RequestMatch() {
  const mark = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const line = mark.current;
    const editor = document.querySelector<HTMLElement>('#project-iodine .recovery');
    const source = editor?.querySelector<HTMLElement>('.recovery-line');
    const batch = document.querySelector<HTMLElement>('#batching-study');
    const canvas = batch?.querySelector<HTMLCanvasElement>('.request-pulse');
    const panel = canvas?.closest('figure');
    if (!line || !editor || !source || !batch || !canvas || !panel) return;
    const motion = matchMedia('(prefers-reduced-motion: no-preference)');
    let frame = 0;
    let armed = false;
    let last = -1;
    let nearby = false;

    const paint = () => {
      frame = 0;
      const height = innerHeight;
      const entry = batch.getBoundingClientRect().top;
      const restored = editor.dataset.restored === 'true';
      if (entry > height * 0.9) armed = restored && entry < height * 1.5;
      else if (restored && entry > height * 0.45) armed = true;
      const inRange = nearby && armed && motion.matches;
      if (!inRange) {
        line.hidden = true;
        editor.removeAttribute('data-mark-departed');
        if (last !== 1) {
          panel.dataset.matchPopulation = '1';
          panel.dispatchEvent(new Event('match-population'));
          last = 1;
        }
        return;
      }
      const editorBox = source.getBoundingClientRect();
      const requestBox = canvas.getBoundingClientRect();
      // Match the actual first request in the letterboxed 640 × 268 drawing.
      const scale = Math.min(requestBox.width / 640, requestBox.height / 268);
      const requestX = requestBox.left + (requestBox.width - 640 * scale) / 2 + 30.5 * scale;
      const requestY = requestBox.top + (requestBox.height - 268 * scale) / 2 + 26 * scale;
      const carry = 1 - easedProgress(entry, height * 0.6, height * 0.86);
      const arrive = 1 - easedProgress(requestY, height * 0.68, height * 0.97);
      const blend = (a: number, b: number, amount: number) => a + (b - a) * amount;
      const handoff = entry <= height * 0.9 && arrive < 0.999;
      line.hidden = !handoff;
      editor.toggleAttribute('data-mark-departed', handoff && entry < height * 0.86);
      const population = easedProgress(arrive, 0.48, 0.99);
      if (population !== last) {
        last = population;
        panel.dataset.matchPopulation = String(population);
        panel.dispatchEvent(new Event('match-population'));
      }
      if (!handoff) return;
      const originX = editorBox.left + Math.min(92, editorBox.width * 0.22);
      const originY = editorBox.bottom + 8 + Math.max(0, height * 0.84 - entry);
      const visible = 1 - easedProgress(entry, height * 0.86, height * 0.9);
      const x = blend(originX, requestX, carry);
      const y = blend(originY, Math.min(requestY, height * 0.73), carry);
      line.style.transform = `translate3d(${x}px,${y}px,0)`;
      line.style.setProperty('--length', blend(54, 11 * scale, carry) + 'px');
      line.style.setProperty('--stroke', blend(2, Math.max(2, 4 * scale), carry) + 'px');
      line.style.setProperty('--glow', String(visible * (1 - easedProgress(arrive, 0.92, 1))));
      line.style.setProperty('--amber', String(carry));
    };

    function schedule() {
      if (!frame && nearby) frame = requestAnimationFrame(paint);
    }
    const intersection = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting;
        if (nearby) schedule();
        else {
          cancelAnimationFrame(frame);
          paint();
        }
      },
      { rootMargin: '100% 0px 100%' },
    );
    intersection.observe(batch);
    const update = new MutationObserver(schedule);
    update.observe(editor, {
      attributes: true,
      attributeFilter: ['data-restored'],
    });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    motion.addEventListener('change', schedule);
    schedule();
    return () => {
      intersection.disconnect();
      update.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      motion.removeEventListener('change', schedule);
    };
  }, []);
  return <div ref={mark} className="proof-match-mark" aria-hidden="true" hidden />;
}
