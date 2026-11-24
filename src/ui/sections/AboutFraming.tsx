import { useEffect, useRef } from 'react';
import { FINISH_MEDIA, finishFrames } from './finishFrames';
import './about-framing.css';
const narrowQuery = '(max-width: 767px)';
const scrollStart = 0.16;
const scrollSpan = 0.76;

function FinishPoster({ finish }: { finish: 'clay' | 'paint' }) {
  return (
    <picture className={'finish-poster finish-poster-' + finish} aria-hidden="true">
      <source media={narrowQuery} srcSet={FINISH_MEDIA + 'mobile-' + finish + '.webp'} />
      <img
        src={FINISH_MEDIA + 'desktop-' + finish + '.webp'}
        alt=""
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
}

export function AboutFraming() {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const range = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const lane = track.current!;
    const player = video.current!;
    const slider = range.current!;
    const motion = matchMedia('(prefers-reduced-motion: no-preference)');
    const narrow = matchMedia(narrowQuery);
    const short = matchMedia('(max-height: 490px)');
    let nearby = false;
    let progress = 0;
    let frame = 0;
    const phoneFrames = finishFrames(canvas.current!, () => progress);

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
      if (narrow.matches) phoneFrames.draw();
      else seek();
    }
    function configure() {
      const moving = nearby && motion.matches && !short.matches;
      if (moving && narrow.matches) phoneFrames.load();
      else phoneFrames.clear();
      if (!moving || narrow.matches) {
        if (player.hasAttribute('src')) {
          player.removeAttribute('src');
          player.load();
        }
        lane.removeAttribute('data-film-ready');
        return;
      }
      const source = FINISH_MEDIA + 'desktop.mp4';
      if (player.getAttribute('src') !== source) {
        lane.removeAttribute('data-film-ready');
        player.src = source;
      }
    }
    const scrollTravel = () => lane.clientHeight - lane.firstElementChild!.clientHeight;
    function paint() {
      frame = 0;
      if (!nearby || !motion.matches || short.matches) return;
      const travel = scrollTravel();
      if (travel > 0) {
        const position = -lane.getBoundingClientRect().top / travel;
        apply(Math.min(1, Math.max(0, (position - scrollStart) / scrollSpan)));
      }
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
      apply(slider.valueAsNumber / 100);
      if (motion.matches && !short.matches) {
        const start = scrollY + lane.getBoundingClientRect().top;
        scrollTo({
          top: start + scrollTravel() * (scrollStart + progress * scrollSpan),
          behavior: 'instant',
        });
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        nearby = entry.isIntersecting;
        updateMedia();
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
      phoneFrames.clear();
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
          <canvas ref={canvas} width={352} height={760} hidden aria-hidden="true" />

          <div className="film-heading">
            <h3 id="finish-study-title">Framing the showroom</h3>
            <p className="finish-cue">Scroll to reveal the paint.</p>
            <p className="finish-cue-manual">Slide to reveal the paint.</p>
          </div>
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
      <div className="about-framing-notes">
        <span>
          Model by{' '}
          <a href="https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95">vecarz</a>, CC
          BY 4.0.
        </span>
      </div>
    </figure>
  );
}
