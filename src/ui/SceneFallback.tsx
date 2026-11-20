import { useState } from 'react';
import { useAppStore } from '../store';
import { StudioPosterSources, STUDIO_POSTER } from './StudioPosterSources';
import './scene-fallback.css';

const angles = [
  { label: 'Opening angle', file: null },
  { label: 'Side profile', file: 'profile' },
  { label: 'Rear deck', file: 'rear-deck' },
];

export function SceneFallback() {
  const [angle, setAngle] = useState(0);
  const intro = useAppStore((state) => state.sectionIndex === 0);
  const studio = useAppStore((state) => state.themeName === 'studio');
  const retry = useAppStore((state) => state.retryScene);
  if (!intro) return null;
  const selected = angles[angle];
  const alternative = selected.file ? `/showroom/fallback/desktop-${selected.file}.webp` : null;
  return (
    <>
      <picture className={studio ? 'scene-fallback-poster studio-media' : 'scene-fallback-poster'}>
        {selected.file ? (
          <source
            media="(max-width: 767px)"
            srcSet={`/showroom/fallback/phone-${selected.file}.webp`}
          />
        ) : studio ? (
          <StudioPosterSources />
        ) : (
          <source media="(max-width: 767px)" srcSet="/showroom/f40-mobile.png" />
        )}
        <img
          src={alternative ?? (studio ? STUDIO_POSTER : '/showroom/f40-desktop.png')}
          width="1440"
          height="1000"
          alt={`Ferrari F40 · ${selected.label}`}
        />
      </picture>
      <div className="scene-recovery">
        <p role="status">Studio photographs · 3D is unavailable.</p>
        <div className="scene-recovery-angles" role="group" aria-label="F40 photographs">
          {angles.map(({ label }, index) => (
            <button
              type="button"
              key={label}
              aria-pressed={index === angle}
              onClick={() => setAngle(index)}
            >
              {label}
            </button>
          ))}
        </div>
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
