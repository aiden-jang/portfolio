import { useLayoutEffect, useRef, useState } from 'react';
import { SCREENSHOT_SIZES } from '../data/screenshotSizes';
import './screenshot-image.css';

type Props = {
  src: string;
  alt: string;
  lazy?: boolean;
  onUnavailable?: () => void;
  onReady?: () => void;
};

export function ScreenshotImage(props: Props) {
  return <ImageResource key={props.src} {...props} />;
}

function ImageResource({ src, alt, lazy = false, onUnavailable, onReady }: Props) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'failed'>('loading');
  const image = useRef<HTMLImageElement>(null);
  const [width, height] = SCREENSHOT_SIZES[src] ?? [1600, 1000];
  useLayoutEffect(() => {
    const current = image.current;
    if (!current?.complete) return;
    if (current.naturalWidth > 0) {
      setStatus('loaded');
      onReady?.();
    } else {
      setStatus('failed');
      onUnavailable?.();
    }
  }, [onUnavailable, onReady]);
  return status === 'failed' ? (
    <span className="screenshot-unavailable" role="status" aria-busy="false">
      <strong>Screenshot unavailable</strong>{' '}
      <span>The project details and app links are still available.</span>
    </span>
  ) : (
    <img
      ref={image}
      className={`screenshot-image ${status === 'loading' ? 'is-loading' : ''}`}
      aria-busy={status === 'loading'}
      src={src}
      alt={alt}
      decoding="async"
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
      onLoad={() => {
        setStatus('loaded');
        onReady?.();
      }}
      onError={() => {
        setStatus('failed');
        onUnavailable?.();
      }}
    />
  );
}
