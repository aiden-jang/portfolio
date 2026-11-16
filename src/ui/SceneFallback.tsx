import { useAppStore } from '../store';
import './scene-fallback.css';

export function SceneFallback() {
  const intro = useAppStore((state) => state.sectionIndex === 0);
  const retry = useAppStore((state) => state.retryScene);
  if (!intro) return null;
  return (
    <>
      <picture className="scene-fallback-poster">
        <source media="(max-width: 767px)" srcSet="/showroom/f40-mobile.png" />
        <img
          src="/showroom/f40-desktop.png"
          width="1440"
          height="1000"
          alt="Static Ferrari F40 showroom preview"
        />
      </picture>
      <div className="scene-recovery">
        <p role="status">Static preview · Your browser couldn’t start 3D.</p>
        <div>
          <button type="button" onClick={retry}>
            Retry 3D
          </button>
          <a href="#sec-work">View projects</a>
        </div>
      </div>
    </>
  );
}
