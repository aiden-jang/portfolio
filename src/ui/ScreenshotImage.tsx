import { useEffect, useRef, useState } from 'react';
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
  const [loaded, setLoaded] = useState(false);
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    setFailed(false);
    setLoaded(!!image.current?.complete && image.current.naturalWidth > 0);
  }, [src]);
  const [width, height] = SCREENSHOT_SIZES[src] ?? [1600, 1000];
  return failed ? (
    <span className="screenshot-unavailable" role="status">
      Screenshot unavailable. The project story and live app are still available.
    </span>
  ) : (
    <img
      ref={image}
      className={`screenshot-image ${loaded ? '' : 'is-loading'}`}
      aria-busy={!loaded}
      src={src}
      alt={alt}
      decoding="async"
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  );
}
