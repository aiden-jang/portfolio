import { useAppStore } from '../store';
import { StudioPosterSources, STUDIO_POSTER } from './StudioPosterSources';
import './scene-fallback.css';

export function SceneFallback() {
  const intro = useAppStore((state) => state.sectionIndex === 0);
  const studio = useAppStore((state) => state.themeName === 'studio');
  const retry = useAppStore((state) => state.retryScene);
  if (!intro) return null;
  return (
    <>
      <picture className={studio ? 'scene-fallback-poster studio-media' : 'scene-fallback-poster'}>
        {studio ? (
          <StudioPosterSources />
        ) : (
          <source media="(max-width: 767px)" srcSet="/showroom/f40-mobile.png" />
        )}
        <img
          src={studio ? STUDIO_POSTER : '/showroom/f40-desktop.png'}
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
