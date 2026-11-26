import { useEffect, useRef, useState } from 'react';
import { PREVIEWS } from '../../data/projectPreviews';
import { ScreenshotViewer } from '../ScreenshotViewer';
import { clamp } from '../../math';
import { dinnerPhoto, WorthCharacter } from './DinnerRating';

type Props = {
  dinner: string;
  bill: string;
  worth: string;
  onReadBill: (trigger: HTMLElement) => void;
  onReadWorth: (trigger: HTMLElement) => void;
};
type Project = 'wherever' | 'owewell' | 'worth';
const range = (n: number, a: number, b: number) => clamp((n - a) / (b - a), 0, 1);

export function DinnerTable({ dinner, bill, worth, onReadBill, onReadWorth }: Props) {
  const [missingPhoto, setMissingPhoto] = useState(false);
  const photo = useRef<HTMLButtonElement>(null);
  const [inspecting, setInspecting] = useState<Project | null>(null);
  const [phase, setPhase] = useState<Project>('wherever');
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current!,
      pin = stage.current!;
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0,
      progress = -1,
      last = 0;
    function paint(now: number) {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(pin).top) || 0;
      const target = clamp((top - rect.top) / Math.max(1, rect.height - pin.offsetHeight), 0, 1);
      const instant = progress < 0 || media.matches || rect.bottom < 0 || rect.top > innerHeight;
      const step = Math.min(220, Math.max(12, now - last)) / 925;
      last = now;
      const next = instant
        ? media.matches
          ? 1
          : target
        : progress + Math.sign(target - progress) * Math.min(Math.abs(target - progress), step);
      if (next === progress) return;
      progress = next;
      const paper = range(progress, 0.06, 0.46),
        split = range(progress, 0.4, 0.65),
        ink = range(progress, 0.77, 0.79),
        land = range(progress, 0.64, 0.77),
        release = range(progress, 0.78, 0.94);
      const ease = (p: number) => 1 - (1 - p) ** 3;
      for (const [key, value] of Object.entries({
        paper: ease(paper),
        split: ease(split),
        ink,
        land,
        release,
        drift: progress,
      })) {
        el.style.setProperty('--' + key, String(value));
      }
      setPhase(ink > 0.1 ? 'worth' : paper > 0.4 ? 'owewell' : 'wherever');
      if (!instant && Math.abs(target - progress) > 0.001) frame = requestAnimationFrame(paint);
    }
    function queue() {
      if (!frame) frame = requestAnimationFrame(paint);
    }
    queue();
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    media.addEventListener('change', queue);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener('scroll', queue);
      removeEventListener('resize', queue);
      media.removeEventListener('change', queue);
    };
  }, []);
  return (
    <article
      id="project-wherever"
      className="dinner-table"
      ref={track}
      data-phase={phase}
      aria-label="wherever, owewell and worth"
    >
      <span className="dinner-anchor dinner-anchor-bill" id="project-owewell" aria-hidden="true" />
      <span className="dinner-anchor dinner-anchor-worth" id="project-worth" aria-hidden="true" />
      <div className="table-shot" ref={stage} data-study-pin>
        <header className="table-projects">
          {[
            [dinner, 'wherever'],
            [bill, 'owewell'],
            [worth, 'worth'],
          ].map(([href, name]) => (
            <a
              href={href}
              key={name}
              data-app={name}
              aria-label={`Open app: ${name}`}
              aria-describedby="external-link-hint"
              target="_blank"
              rel="noopener"
            >
              {name} <span aria-hidden="true">↗</span>
            </a>
          ))}
        </header>
        <button
          type="button"
          className="table-print"
          ref={photo}
          aria-label={`Inspect screenshot: ${phase}`}
          onClick={() => setInspecting(phase)}
        >
          {missingPhoto ? (
            <span role="status">Pizza photo unavailable</span>
          ) : (
            <img
              src={dinnerPhoto}
              loading="lazy"
              decoding="async"
              alt="The pizza Alex and Maya chose"
              onError={() => setMissingPhoto(true)}
            />
          )}
        </button>
        <div className="table-slip">
          <div className="slip-head">
            <h3>
              Neighborhood
              <br />
              Pizza Kitchen
            </h3>
            <span className="slip-votes">
              <span>Alex ✓</span> <span>Maya ✓</span>
            </span>
          </div>
          <div className="slip-fold">
            <div className="slip-inside">
              <button
                className="slip-total"
                type="button"
                aria-label="How I built it: owewell"
                onClick={(e) => onReadBill(e.currentTarget)}
              >
                <span>Dinner for two</span>
                <strong>$48.00</strong>
              </button>
              <div className="slip-shares">
                <div>
                  <small>Your share</small>
                  <b>$24.00</b>
                </div>
                <div>
                  <small>Alex owes you</small>
                  <b>$24.00</b>
                </div>
              </div>
              <div className="slip-verdict">
                <button
                  type="button"
                  className="ink-imprint"
                  aria-label="How I built it: worth"
                  onClick={(e) => onReadWorth(e.currentTarget)}
                >
                  Favorite.
                </button>
                <WorthCharacter />
              </div>
            </div>
          </div>
        </div>
      </div>
      {inspecting && (
        <ScreenshotViewer
          name={inspecting}
          image={PREVIEWS[inspecting]!.image}
          caption={PREVIEWS[inspecting]!.caption}
          returnFocus={photo.current}
          onClose={() => setInspecting(null)}
        />
      )}
    </article>
  );
}
