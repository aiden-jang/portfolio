import { useEffect, useRef } from 'react';
import { openAboutShot } from '../../garageStudio/aboutShot';
import { useAppStore } from '../../store';
import { ControlIcon } from '../ControlIcon';
import './about-framing.css';

const media = '/showroom/finish-study/';
const narrowQuery = '(max-width: 767px)';

function FinishPoster({ finish }: { finish: 'clay' | 'paint' }) {
  return (
    <picture className={'finish-poster finish-poster-' + finish} aria-hidden="true">
      <source media={narrowQuery} srcSet={media + 'mobile-' + finish + '.webp'} />
      <img src={media + 'desktop-' + finish + '.webp'} alt="" loading="lazy" decoding="async" />
    </picture>
  );
}

export function AboutFraming() {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const sceneUnavailable = useAppStore((state) => state.sceneUnavailable);

  useEffect(() => {
    const lane = track.current!;
    const player = video.current!;
    const slider = range.current!;
    const motion = matchMedia('(prefers-reduced-motion: no-preference)');
    const narrow = matchMedia(narrowQuery);
    const short = matchMedia('(max-height: 490px)');
    let nearby = false;
    let manual = false;
    let progress = 0;
    let frame = 0;

    function seek() {
      if (player.readyState < 1 || !Number.isFinite(player.duration) || player.seeking) return;
      const time = progress * Math.max(0, player.duration - 1 / 24);
      if (Math.abs(player.currentTime - time) > 0.018) player.currentTime = time;
    }
    function apply(next: number) {
      if (progress !== next) {
        progress = next;
        slider.value = String(Math.round(progress * 100));
        slider.setAttribute(
          'aria-valuetext',
          progress < 0.43 ? 'Clay' : progress < 0.75 ? 'Changing to paint' : 'Paint',
        );
        lane.style.setProperty('--finish-paint', String(progress));
      }
      seek();
    }
    function configure() {
      if (!nearby || !motion.matches || short.matches) {
        if (player.hasAttribute('src')) {
          player.removeAttribute('src');
          player.load();
        }
        lane.removeAttribute('data-film-ready');
        return;
      }
      const source = media + (narrow.matches ? 'mobile.mp4' : 'desktop.mp4');
      if (player.getAttribute('src') !== source) {
        lane.removeAttribute('data-film-ready');
        player.src = source;
      }
    }
    function paint() {
      frame = 0;
      if (!motion.matches || short.matches) return;
      const rect = lane.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > innerHeight) manual = false;
      if (manual || !nearby) return;
      const travel = lane.clientHeight - lane.firstElementChild!.clientHeight;
      if (travel > 0) apply(Math.min(1, Math.max(0, -rect.top / travel)));
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    function updateMedia() {
      configure();
      schedule();
    }
    function markReady() {
      lane.setAttribute('data-film-ready', '');
      seek();
    }
    const showPoster = () => lane.removeAttribute('data-film-ready');
    const useSlider = () => {
      manual = true;
      apply(slider.valueAsNumber / 100);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting;
        if (nearby) updateMedia();
      },
      { rootMargin: '720px' },
    );
    observer.observe(lane);
    for (const query of [motion, narrow, short]) query.addEventListener('change', updateMedia);
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    player.addEventListener('loadedmetadata', seek);
    player.addEventListener('loadeddata', markReady);
    player.addEventListener('error', showPoster);
    player.addEventListener('seeked', seek);
    slider.addEventListener('input', useSlider);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      for (const query of [motion, narrow, short]) query.removeEventListener('change', updateMedia);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      player.removeEventListener('loadedmetadata', seek);
      player.removeEventListener('loadeddata', markReady);
      player.removeEventListener('error', showPoster);
      player.removeEventListener('seeked', seek);
      slider.removeEventListener('input', useSlider);
    };
  }, []);

  return (
    <figure className="about-framing-study" aria-labelledby="finish-study-title">
      <div className="scroll-film-track" ref={track}>
        <div className="scroll-film">
          <FinishPoster finish="clay" />
          <FinishPoster finish="paint" />
          <video ref={video} muted playsInline preload="auto" aria-hidden="true" />
          <h3 id="finish-study-title">Framing the showroom</h3>
          <div className="scroll-film-range">
            <span aria-hidden="true">Clay</span>
            <input
              ref={range}
              type="range"
              min="0"
              max="100"
              defaultValue="0"
              aria-label="Ferrari camera and finish"
              aria-valuetext="Clay"
            />
            <span aria-hidden="true">Paint</span>
          </div>
        </div>
      </div>
      <figcaption className="about-framing-notes">
        <span>
          Model by{' '}
          <a href="https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95">vecarz</a>, CC
          BY 4.0.
        </span>
        <div className="about-framing-actions">
          {!sceneUnavailable && (
            <button
              className="creative-about-action"
              type="button"
              aria-label="Open this shot in Studio"
              onClick={(event) => openAboutShot(event.currentTarget)}
            >
              Studio
            </button>
          )}
          <a className="creative-about-action" href="/cases/showroom/">
            How I built the showroom <ControlIcon name="arrow" />
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
