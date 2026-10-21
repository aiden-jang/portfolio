import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { usePageScrollLock } from './usePageScrollLock';

type Props = { onClose: () => void; returnFocus: HTMLElement | null };

export function CarBrowser({ onClose, returnFocus }: Props) {
  const index = useAppStore((state) => state.carIndex);
  const choose = useAppStore((state) => state.setCarIndex);
  const loading = useAppStore((state) => state.isCarLoading);
  const error = useAppStore((state) => state.carLoadError);
  const retry = useAppStore((state) => state.retryCar);
  const dialog = useRef<HTMLDialogElement>(null);
  const options = useRef<(HTMLButtonElement | null)[]>([]);
  usePageScrollLock(true);
  useEffect(() => {
    dialog.current?.showModal();
    options.current[index]?.focus({ preventScroll: true });
    options.current[index]?.scrollIntoView({ block: 'nearest' });
    return () => {
      const target =
        returnFocus?.isConnected && returnFocus.getClientRects().length
          ? returnFocus
          : Array.from(document.querySelectorAll<HTMLButtonElement>('.car-browse-trigger')).find(
              (element) => element.getClientRects().length,
            );
      target?.focus({ preventScroll: true });
    };
  }, [index, returnFocus]);
  return createPortal(
    <dialog
      ref={dialog}
      className="car-browser"
      aria-labelledby="car-browser-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        const position = options.current.indexOf(event.target as HTMLButtonElement);
        if (position < 0) return;
        const columns = window.matchMedia('(min-width: 1000px)').matches
          ? 4
          : window.matchMedia('(min-width: 700px)').matches
            ? 3
            : 2;
        const steps: Record<string, number> = {
          ArrowLeft: -1,
          ArrowRight: 1,
          ArrowUp: -columns,
          ArrowDown: columns,
        };
        let target: number | undefined;
        if (event.key in steps) {
          const next = position + steps[event.key];
          target =
            event.key === 'ArrowLeft' || event.key === 'ArrowRight'
              ? (next + CARS.length) % CARS.length
              : next >= 0 && next < CARS.length
                ? next
                : position;
        }
        if (event.key === 'Home') target = 0;
        if (event.key === 'End') target = CARS.length - 1;
        if (target !== undefined) {
          event.preventDefault();
          options.current[target]?.focus();
        }
      }}
    >
      <header className="car-browser-heading">
        <div>
          <h2 id="car-browser-title">Pick your ride.</h2>
          <p>No keys included.</p>
        </div>
        <button type="button" aria-label="Close car browser" onClick={onClose}>
          Close ×
        </button>
      </header>
      <div className="car-browser-grid">
        {CARS.map((car, position) => (
          <div key={car.file} className="car-browser-card">
            <button
              ref={(element) => {
                options.current[position] = element;
              }}
              type="button"
              className="car-option"
              aria-label={`${index === position && error ? 'Retry' : 'Show'} ${car.name}, ${car.code}`}
              aria-pressed={index === position}
              aria-disabled={loading}
              onClick={() => {
                if (loading) return;
                if (position !== index) choose(position);
                else if (error) retry();
                onClose();
              }}
            >
              <CarThumbnail file={car.file} />
              <span className="car-option-name">
                {car.name}
                <span aria-hidden="true">{index === position ? '✓' : '↗'}</span>
              </span>
              <span className="car-option-code">
                {car.code}
                {index === position ? (error ? ' · Choose to retry' : ' · Selected') : ''}
                <span className="block">{car.defaultPaint.name}</span>
              </span>
            </button>
            {car.credit && (
              <a
                href={car.credit.url}
                target="_blank"
                aria-describedby="external-link-hint"
                rel="noopener noreferrer"
              >
                Model by {car.credit.author} ↗
              </a>
            )}
          </div>
        ))}
      </div>
      <footer className="car-browser-footer">
        <span>Individual model licenses apply. Credits in Contact.</span>
        <span role="status">{error ?? (loading ? `Loading ${CARS[index].name}…` : '')}</span>
        <span>Arrow keys to browse · Enter to choose</span>
      </footer>
    </dialog>,
    document.body,
  );
}

function CarThumbnail({ file }: { file: string }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <span className="car-preview-placeholder">Preview unavailable</span>
  ) : (
    <img
      src={`/cars/${file.replace('.glb', '.jpg')}`}
      width="640"
      height="360"
      alt=""
      onError={() => setFailed(true)}
    />
  );
}
