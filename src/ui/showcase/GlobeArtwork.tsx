import type { Ref } from 'react';
import { ScreenshotImage } from '../ScreenshotImage';
import { QuakeMap } from './quakeJourney';

type Props = {
  image: string;
  fallback: boolean;
  canvas: Ref<HTMLCanvasElement>;
  started: boolean;
  loading: boolean;
  ready: boolean;
  journey?: boolean;
  onPosterReady: () => void;
  onPosterUnavailable: () => void;
  onScreenshotUnavailable: () => void;
};

export function GlobeArtwork({
  image,
  fallback,
  canvas,
  started,
  loading,
  ready,
  journey,
  onPosterReady,
  onPosterUnavailable,
  onScreenshotUnavailable,
}: Props) {
  return (
    <div className="preview-thumbnail">
      <div className="orbit-art" data-poster={!fallback}>
        <ScreenshotImage
          key={fallback ? 'screenshot' : 'poster'}
          src={fallback ? image : '/projects/atlas-globe-desktop.webp'}
          narrowSrc={fallback ? undefined : '/projects/atlas-globe-phone.webp'}
          alt={
            fallback
              ? 'meanwhile. product interface'
              : 'Globe centered on the North Pacific, with the Kamchatka earthquake marked'
          }
          lazy
          onReady={fallback ? undefined : onPosterReady}
          onUnavailable={fallback ? onScreenshotUnavailable : onPosterUnavailable}
        />
        {started && (
          <div className="orbit-viewport" aria-busy={loading}>
            <canvas
              ref={canvas}
              id="globe-view"
              tabIndex={ready ? 0 : -1}
              role="img"
              aria-label="Interactive globe. Drag or use arrow keys to rotate. Press zero to reset, Escape to finish."
            />
          </div>
        )}
        {journey && <QuakeMap />}
      </div>
    </div>
  );
}
