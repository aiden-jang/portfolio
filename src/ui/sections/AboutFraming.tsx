import { useId, useState, type CSSProperties } from 'react';
import { openAboutShot } from '../../garageStudio/aboutShot';
import { useAppStore } from '../../store';
import { ControlIcon } from '../ControlIcon';

export function AboutFraming() {
  const [amount, setAmount] = useState(50);
  const id = useId();
  const sceneUnavailable = useAppStore((state) => state.sceneUnavailable);
  return (
    <figure className="about-framing-study">
      <div
        className="about-framing-image"
        style={{ '--paint-reveal': amount + '%' } as CSSProperties}
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
        <span className="about-frame-lines" aria-hidden="true" />
        <span className="about-frame-split" aria-hidden="true" />
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
          onChange={(event) => setAmount(event.currentTarget.valueAsNumber)}
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
