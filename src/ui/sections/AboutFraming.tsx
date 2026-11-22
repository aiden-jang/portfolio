import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { openAboutShot } from '../../garageStudio/aboutShot';
import { useAppStore } from '../../store';
import { ControlIcon } from '../ControlIcon';

export function AboutFraming() {
  const [amount, setAmount] = useState(0);
  const image = useRef<HTMLDivElement>(null);
  const [manual, setManual] = useState(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    function update() {
      frame = 0;
      if (manual || !image.current) return;
      if (reduced.matches) {
        setAmount(50);
        return;
      }
      const { top, height } = image.current.getBoundingClientRect();
      const headerBottom =
        document.querySelector('.portfolio-header')?.getBoundingClientRect().bottom ?? 0;
      const visibleSpace = Math.max(0, innerHeight - height - headerBottom);
      const start = innerHeight - height - visibleSpace * 0.54;
      const end = Math.max(headerBottom + 16, innerHeight * 0.23);
      // Keep the complete clay frame visible before scrubbing into the paint.
      const travel = Math.max(64, start - end);
      setAmount(Math.round(100 * Math.max(0, Math.min(1, (start - top) / travel))));
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    addEventListener('scroll', schedule, { passive: true });
    addEventListener('resize', schedule);
    reduced.addEventListener('change', schedule);
    update();
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', schedule);
      removeEventListener('resize', schedule);
      reduced.removeEventListener('change', schedule);
    };
  }, [manual]);
  const reveal = manual || amount === 0 || amount === 100 ? amount : 14 + 0.66 * amount;
  const id = useId();
  const sceneUnavailable = useAppStore((state) => state.sceneUnavailable);
  return (
    <figure className="about-framing-study">
      <div
        ref={image}
        className="about-framing-image"
        style={{ '--paint-reveal': reveal + '%' } as CSSProperties}
      >
        <img
          src="/projects/showroom-finished.webp"
          alt="Finished Ferrari F40, framed low with room for its reflection"
          width="1440"
          height="900"
          loading="lazy"
        />
        <img
          src="/projects/showroom-clay.webp"
          alt=""
          aria-hidden="true"
          className="about-frame-clay"
          width="1440"
          height="900"
          loading="lazy"
        />
        {manual && amount > 0 && amount < 100 && (
          <span className="about-frame-split" aria-hidden="true" />
        )}
      </div>
      <div className="about-frame-scrub">
        <label htmlFor={id}>Clay to finished paint</label>
        <input
          id={id}
          type="range"
          value={amount}
          min={0}
          max={100}
          aria-valuetext={amount + '% finished paint'}
          onChange={(event) => {
            setManual(true);
            setAmount(event.currentTarget.valueAsNumber);
          }}
        />
      </div>
      <figcaption>
        <strong>Framing the showroom</strong>
        <span>
          The low camera fits the front wheel and rear wing in one shot, with room below for the
          reflection.
        </span>
        <span>
          Model by{' '}
          <a href="https://sketchfab.com/3d-models/ee082e412b0a4b2090e8492117841e95">vecarz</a>, CC
          BY 4.0.
        </span>
      </figcaption>
      <div className="about-framing-actions">
        {!sceneUnavailable && (
          <button
            className="creative-about-action"
            type="button"
            onClick={(event) => openAboutShot(event.currentTarget)}
          >
            Open this shot in Studio
          </button>
        )}
        <a className="creative-about-action" href="/cases/showroom/">
          How I built the showroom <ControlIcon name="arrow" />
        </a>
      </div>
    </figure>
  );
}
