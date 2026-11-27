import type { Ref } from 'react';
import { ScreenshotImage } from '../ScreenshotImage';
import { QuakeReadings } from './quakeJourney';

type Props = {
  canvasId?: string;
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
  canvasId = 'globe-view',
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
          shortSrc={fallback ? undefined : '/projects/atlas-globe-short.webp'}
          alt={
            fallback
              ? 'meanwhile. product interface'
              : 'Globe centered on the North Pacific, with the Kamchatka earthquake marked'
          }
          onReady={fallback ? undefined : onPosterReady}
          onUnavailable={fallback ? onScreenshotUnavailable : onPosterUnavailable}
        />
        {started && (
          <div className="orbit-viewport" aria-busy={loading}>
            <canvas
              ref={canvas}
              id={canvasId}
              data-cinema={journey || undefined}
              tabIndex={ready ? 0 : -1}
              role="img"
              aria-label="Interactive globe. Drag or use arrow keys to rotate. Press zero to reset, Escape to finish."
            />
          </div>
        )}
      </div>
      {journey && <QuakeReadings />}
    </div>
  );
}

export function GlobeCaption({ phase, captured }: { phase: string; captured: string }) {
  return (
    <figcaption aria-live="polite" className={phase === 'error' ? 'orbit-fallback' : 'sr-only'}>
      {phase === 'error'
        ? 'The globe could not start. Retry it, view the screenshot, or open Compare agency reports.'
        : phase === 'ready'
          ? `Drag to rotate and select a marker. Recorded USGS earthquakes${captured ? ' · ' + captured + ' UTC' : ''}, NOAA wind and aurora, and RainViewer radar.`
          : phase === 'loading'
            ? 'Preparing globe…'
            : 'Recorded Kamchatka earthquake. Explore the globe to browse more recorded events.'}
    </figcaption>
  );
}
