import { useCallback, useRef } from 'react';
import { useTimedScene } from '../../hooks/useTimedScene';

export function PlatformHandoff() {
  const preview = useRef<HTMLDivElement>(null);
  const draw = useCallback((progress: number) => {
    if (preview.current) preview.current.dataset.open = String(progress >= 0.48);
  }, []);
  useTimedScene(preview, draw, { duration: 2400, hold: 2250, startThreshold: 0.38 });

  return (
    <div ref={preview} className="platform-handoff" data-open="false">
      <div className="platform-hub">
        <img
          src="/projects/platform-hub-detail.webp"
          alt="The shared accounts hub lists worth among the signed-in apps."
          loading="lazy"
        />
        <span>Choose worth</span>
      </div>
      <div className="platform-archive">
        <img
          src="/projects/platform-app-detail.webp"
          alt="The same account opens its saved rankings in worth."
          loading="lazy"
        />
        <span>Already signed in</span>
      </div>
    </div>
  );
}
