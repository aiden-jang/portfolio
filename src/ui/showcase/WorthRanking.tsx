import { useCallback, useEffect, useRef } from 'react';
import { useTimedScene } from '../../hooks/useTimedScene';
import { easedProgress } from '../../hooks/useScrollStudy';
import { ScreenshotImage } from '../ScreenshotImage';

export function WorthRanking({ onUnavailable }: { onUnavailable: () => void }) {
  const panel = useRef<HTMLSpanElement>(null);
  const draw = useCallback((progress: number) => {
    const node = panel.current;
    if (!node) return;
    node.toggleAttribute('data-ranked', progress >= 0.56);
    node.style.setProperty('--verdict-progress', String(easedProgress(progress, 0.7, 0.92)));
  }, []);
  const finish = useTimedScene(panel, draw, { duration: 1980, hold: 1400 });
  useEffect(() => {
    const preview = panel.current?.closest('button');
    const settle = () => finish(1, 1000);
    preview?.addEventListener('pointerenter', settle);
    preview?.addEventListener('focus', settle);
    return () => {
      preview?.removeEventListener('pointerenter', settle);
      preview?.removeEventListener('focus', settle);
    };
  }, [finish]);

  return (
    <span ref={panel} className="worth-focus worth-ranking" aria-hidden="true">
      <span className="worth-ranking-heading">Drinks</span>
      <span className="worth-ranking-list">
        <span className="worth-ranking-row worth-ranking-sake">Brooklyn Kura Sake Junmai</span>
        <span className="worth-ranking-row worth-ranking-ipa">Goose Island IPA</span>
      </span>
      <span className="worth-ranking-verdict">
        <ScreenshotImage
          src="/projects/worth-verdict.webp"
          alt=""
          lazy
          onUnavailable={onUnavailable}
        />
      </span>
    </span>
  );
}
