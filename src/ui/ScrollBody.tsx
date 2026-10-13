import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import './browsing-polish.css';

const readingPositions = new Map<string, { top: number; expanded: number[] }>();

export function ScrollBody({ children, storyId }: { children: ReactNode; storyId: string }) {
  const area = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  const [progress, setProgress] = useState(0);
  useLayoutEffect(() => {
    const element = area.current!;
    const saved = readingPositions.get(storyId);
    if (saved) {
      const details = element.querySelectorAll('details');
      saved.expanded.forEach((index) => {
        if (details[index]) details[index].open = true;
      });
      element.scrollTop = saved.top;
    }
    return () => {
      readingPositions.set(storyId, {
        top: element.scrollTop,
        expanded: Array.from(element.querySelectorAll('details')).flatMap((detail, index) =>
          detail.open ? [index] : [],
        ),
      });
    };
  }, [storyId]);
  useEffect(() => {
    const element = area.current!;
    const update = () => {
      const remaining = element.scrollHeight - element.clientHeight;
      setMore(remaining - element.scrollTop > 16);
      setProgress(remaining > 0 ? Math.min(1, element.scrollTop / remaining) : 1);
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    observer.observe(content.current!);
    element.addEventListener('scroll', update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
    };
  }, []);
  return (
    <div className="story-scroll-shell">
      <div
        className="story-reading-progress"
        role="progressbar"
        aria-label="Case study reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
      >
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div
        ref={area}
        className="story-scroll-area overflow-y-auto overscroll-contain p-5 pt-5 md:p-7 md:pt-6"
      >
        <div ref={content}>{children}</div>
      </div>
      {more && (
        <div className="story-scroll-cue">
          <button
            type="button"
            onClick={() =>
              area.current?.scrollBy({
                top: area.current.clientHeight * 0.7,
                behavior: prefersReducedMotion() ? 'instant' : 'smooth',
              })
            }
          >
            Continue reading ↓
          </button>
        </div>
      )}
    </div>
  );
}
