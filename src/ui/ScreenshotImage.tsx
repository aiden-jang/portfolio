import { useState } from 'react';
import { SCREENSHOT_SIZES } from '../data/screenshotSizes';
import './screenshot-image.css';

export function ScreenshotImage({
  src,
  alt,
  lazy = false,
}: {
  src: string;
  alt: string;
  lazy?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const [width, height] = SCREENSHOT_SIZES[src] ?? [1600, 1000];
  return failed ? (
    <span className="screenshot-unavailable" role="status">
      Screenshot unavailable. The project story and live app are still available.
    </span>
  ) : (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      onError={() => setFailed(true)}
    />
  );
}
