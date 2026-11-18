import { useLayoutEffect, useRef, useState } from 'react';
import { useAppStore } from '../store';
import { framingDistanceMultiplier } from '../three/cameraPose';
import './opening-poster.css';

function isDefaultOpening() {
  const params = new URLSearchParams(location.search);
  return (
    scrollY <= 1 &&
    (!location.hash || location.hash === '#sec-intro') &&
    (params.get('car') ?? '0') === '0' &&
    (params.get('paint') ?? 'original') === 'original' &&
    (params.get('light') ?? 'dusk') === 'dusk'
  );
}

export function OpeningPoster() {
  const [eligible] = useState(isDefaultOpening);
  const [phase, setPhase] = useState<'loading' | 'fading' | 'done'>('loading');
  const picture = useRef<HTMLPictureElement>(null);
  const photo = useRef<HTMLImageElement>(null);
  const finish = useRef<() => void>();

  useLayoutEffect(() => {
    if (!eligible) return;
    const { body } = document;
    const { refs } = useAppStore.getState();
    let timer = 0;
    let frame = 0;
    let finished = false;
    body.dataset.openingMedia = '';
    refs.holdOpeningPose = true;
    const fit = () => {
      const referenceAspect = innerWidth < 768 ? 390 / 844 : 1440 / 900;
      const scale =
        framingDistanceMultiplier(referenceAspect) /
        framingDistanceMultiplier(innerWidth / innerHeight);
      picture.current?.style.setProperty('--opening-poster-scale', String(scale));
    };
    const end = () => {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      delete body.dataset.openingPoster;
      finish.current = undefined;
      refs.onOpeningFrame = null;
      refs.holdOpeningPose = false;
      setPhase('done');
    };
    finish.current = end;
    refs.onOpeningFrame = () => {
      refs.onOpeningFrame = null;
      if (!photo.current?.complete || !photo.current.naturalWidth) {
        end();
        return;
      }
      // The effects pass has rendered at the poster pose. Let the browser present
      // that frame before removing the still and releasing the opening orbit.
      frame = requestAnimationFrame(() => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) end();
        else {
          setPhase('fading');
          timer = window.setTimeout(end, 210);
        }
      });
    };
    const onScroll = () => {
      if (scrollY > 1) end();
    };
    const unsubscribe = useAppStore.subscribe((state) => {
      if (
        state.sceneUnavailable ||
        state.carLoadError ||
        state.carIndex !== 0 ||
        state.themeName !== 'dusk' ||
        state.activeBodyColor !== 'original' ||
        state.hasManualView
      )
        end();
    });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', fit);
    fit();
    onScroll();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', fit);
      delete body.dataset.openingMedia;
      delete body.dataset.openingPoster;
      refs.onOpeningFrame = null;
      refs.holdOpeningPose = false;
      finish.current = undefined;
    };
  }, [eligible]);

  if (!eligible || phase === 'done') return null;

  return (
    <picture
      ref={picture}
      className="opening-poster"
      aria-hidden="true"
      data-fading={phase === 'fading' || undefined}
      onTransitionEnd={(event) => {
        if (event.propertyName === 'opacity') finish.current?.();
      }}
    >
      <source
        media="(width < 768px) and (prefers-reduced-motion: reduce)"
        srcSet="/showroom/f40-mobile-settled.webp"
      />
      <source media="(width < 768px)" srcSet="/showroom/f40-mobile-opening.webp" />
      <source
        media="(prefers-reduced-motion: reduce)"
        srcSet="/showroom/f40-desktop-settled.webp"
      />
      <img
        ref={photo}
        src="/showroom/f40-desktop-opening.webp"
        width={1440}
        height={900}
        alt=""
        onLoad={() => {
          if (finish.current) document.body.dataset.openingPoster = '';
        }}
        onError={() => finish.current?.()}
      />
    </picture>
  );
}
