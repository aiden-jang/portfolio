import { useEffect, useRef, useState, type ReactNode } from 'react';
import { prefersReducedMotion } from '../hooks/useReducedMotion';
import './browsing-polish.css';

export function ScrollBody({ children }: { children: ReactNode }) {
  const area = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const element = area.current!;
    const update = () =>
      setMore(element.scrollHeight - element.clientHeight - element.scrollTop > 16);
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
