import { StudyControls, StudioInvitation } from '../garageStudy/StudyControls';
import { useGarageStudy } from '../garageStudy/state';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { ControlIcon } from '../ui/ControlIcon';
import { CarBrowser } from '../ui/CarBrowser';
import { useDialogFocus } from '../ui/useDialogFocus';
import { usePageScrollLock } from '../ui/usePageScrollLock';
import { copyText } from '../browserSharing';
import { downloadPhoto } from '../ui/photo/postcard';
import { useLineup } from '../lineup/state';
import {
  chapters,
  photoRatio,
  repaintStudio,
  shotUrl,
  useGarageStudio,
  supportsDetail,
  type Chapter,
  type Study,
} from './state';
import { captureFramedPhoto } from './photo';
import { StudioOrbit } from './StudioOrbit';
import { StudioViews } from './StudioViews';
import { StudioStudy } from './StudioStudy';
import { StudioShotLink } from './StudioShotLink';
import './garage-studio.css';
import '../ui/car-picker.css';

export function GarageStudio() {
  const { chapter, proposed, photo, study, close, select, selectCar } = useGarageStudio();
  const id = useAppStore((s) => s.carIndex);
  const loading = useAppStore((s) => s.isCarLoading);
  const error = useAppStore((s) => s.carLoadError);
  const retryCar = useAppStore((s) => s.retryCar);
  const pairReady = useLineup((s) => s.status);
  const dialog = useRef<HTMLElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const choose = useRef<HTMLButtonElement>(null);
  const [picker, setPicker] = useState(false);
  const [dragging, setDragging] = useState(false);
  const shareVersion = useRef(0);
  const [notice, setNotice] = useState('');
  const captureVersion = useRef(0);
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<{ src: string; file: File } | null>(null);
  const [link, setLink] = useState('');
  const pair = chapter === 'lineup';
  const car = CARS[id];
  const waiting = pair ? pairReady !== 'ready' : loading || !!error;
  usePageScrollLock(true);
  useDialogFocus(!picker, dialog, exit);
  const leaveTool = useCallback(() => {
    useGarageStudio.setState({ photo: null, study: null });
    useAppStore.setState({ renderFinish: null });
    captureVersion.current++;
    setBusy(false);
    setImage(null);
    dismissLink();
    repaintStudio();
  }, []);

  useEffect(() => {
    repaintStudio();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const { photo, study } = useGarageStudio.getState();
      leaveTool();
      if (!photo && !study) close();
    };
    const unsubscribe = useAppStore.subscribe((next, previous) => {
      if (
        (!next.sceneUnavailable || previous.sceneUnavailable) &&
        (!next.isContactVisible || previous.isContactVisible)
      )
        return;
      leaveTool();
      close();
    });
    window.addEventListener('keydown', onKey, true);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      unsubscribe();
      repaintStudio();
      queueMicrotask(() => {
        if (useGarageStudio.getState().active) return;
        Array.from(document.querySelectorAll<HTMLButtonElement>('.all-controls-trigger'))
          .find((button) => button.getClientRects().length)
          ?.focus({ preventScroll: true });
      });
    };
  }, [close, leaveTool]);
  useEffect(() => (image ? () => URL.revokeObjectURL(image.src) : undefined), [image]);

  function setStudy(pass: Study) {
    useGarageStudio.setState({ study: pass, photo: null });
    useAppStore.setState({ renderFinish: pass === 'clay' ? 'clay' : null });
    dismissLink();
    repaintStudio();
  }

  function selectChapter(next: Chapter) {
    leaveTool();
    select(next);
  }

  function dismissLink() {
    shareVersion.current++;
    setLink('');
    setNotice('');
  }

  async function share() {
    const url = shotUrl();
    const version = ++shareVersion.current;
    setLink(url);
    const result = await copyText(url);
    if (version === shareVersion.current)
      setNotice(result === 'copied' ? 'Shot link copied.' : 'Your shot link is ready to copy.');
  }

  async function takePhoto() {
    if (!photo || busy) return;
    const version = ++captureVersion.current;
    setBusy(true);
    setNotice('');
    try {
      const blob = await captureFramedPhoto(photo);
      if (version !== captureVersion.current) return;
      const file = new File(
        [blob],
        `studio-${pair ? 'lineup' : car.file.replace('.glb', '')}-${photo}.png`,
        { type: 'image/png' },
      );
      setImage({ src: URL.createObjectURL(file), file });
    } catch {
      if (version === captureVersion.current) setNotice('Photo could not be captured. Try again.');
    } finally {
      if (version === captureVersion.current) setBusy(false);
    }
  }

  const title = photo ? 'Photo mode' : study ? 'Behind the render' : chapters[chapter];
  const subtitle = pair ? 'Ferrari F40 & Red Bull RB16B' : car.name;
  return (
    <section
      ref={dialog}
      className="garage-studio"
      aria-label="Garage Studio"
      aria-modal="true"
      role="dialog"
      data-live-scene
      data-chapter={chapter}
      data-variant={proposed ? 'proposed' : 'current'}
      data-ready={!waiting}
      data-dragging={dragging}
    >
      <StudioOrbit enabled={!waiting && !image} onDrag={setDragging} />
      <header className="garage-studio-header">
        <span>AJ / Studio</span>
        <button
          ref={exit}
          type="button"
          className="studio-return"
          onClick={() => {
            leaveTool();
            close();
          }}
        >
          <ControlIcon name="arrow" /> Back to Garage
        </button>
      </header>
      <div className="garage-studio-title">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {!photo && !study && <StudyControls waiting={waiting} />}
      {photo && !image && (
        <div
          className="studio-photo-guide"
          style={{ '--photo-ratio': photoRatio(photo) } as CSSProperties}
          aria-hidden="true"
        />
      )}
      {image && (
        <div className="studio-photo-result">
          <img src={image.src} alt="Captured studio photograph" />
        </div>
      )}
      {waiting && (
        <div className="studio-scene-status" role="status">
          {pair && pairReady === 'failed'
            ? 'Lineup could not load.'
            : error || (pair ? 'Bringing both cars into Studio…' : `Loading ${car.name}…`)}
          {(error || (pairReady === 'failed' && pair)) && (
            <button type="button" onClick={pair ? useLineup.getState().retry : retryCar}>
              Retry
            </button>
          )}
        </div>
      )}
      <footer className="garage-studio-footer">
        {!photo && !study && <StudioInvitation dragging={dragging} />}
        <div className="garage-studio-dock">
          <div className="garage-studio-row studio-chapters" aria-label="Garage views" role="group">
            {(Object.keys(chapters) as Chapter[]).map((name) => (
              <button
                key={name}
                aria-pressed={chapter === name}
                onClick={() => selectChapter(name)}
              >
                {chapters[name]}
              </button>
            ))}
          </div>

          {!photo && !study && <StudioViews waiting={waiting} />}

          {photo && (
            <div className="garage-studio-row" aria-label="Photo controls" role="group">
              {(['portrait', 'landscape'] as const).map((shape) => (
                <button
                  key={shape}
                  aria-pressed={photo === shape}
                  disabled={busy}
                  onClick={() => {
                    useGarageStudio.setState({ photo: shape });
                    setImage(null);
                    repaintStudio();
                  }}
                >
                  {shape === 'portrait' ? 'Portrait 4:5' : 'Landscape 16:9'}
                </button>
              ))}
              <button
                className="studio-strong"
                disabled={busy || waiting}
                onClick={() => (image ? downloadPhoto(image.file) : void takePhoto())}
              >
                {image ? 'Save photo' : busy ? 'Capturing…' : 'Capture'}
              </button>
              {image && <button onClick={() => setImage(null)}>Retake</button>}
              <button onClick={leaveTool}>Done</button>
            </div>
          )}

          {study && <StudioStudy study={study} onSelect={setStudy} onDone={leaveTool} />}

          {!photo && !study && (
            <div className="garage-studio-row studio-tools" aria-label="Garage tools" role="group">
              <button ref={choose} disabled={pair} onClick={() => setPicker(true)}>
                Choose car
              </button>
              <button
                disabled={waiting}
                onClick={() => {
                  useGarageStudy.setState({ playing: false });
                  useGarageStudio.setState({ photo: 'portrait' });
                  repaintStudio();
                }}
              >
                Photo
              </button>
              <button disabled={waiting} onClick={() => void share()}>
                Share shot
              </button>
              <button disabled={waiting || pair} onClick={() => setStudy('finished')}>
                Render study
              </button>
            </div>
          )}
          {notice && (
            <p className="studio-tool-note" role="status">
              {notice}
            </p>
          )}
          {link && !photo && !study && <StudioShotLink value={link} onClose={dismissLink} />}
        </div>
      </footer>
      {picker && (
        <CarBrowser
          onChoose={(next) => {
            if (chapter === 'detail' && !supportsDetail(next)) selectChapter('walk');
            selectCar(next);
            repaintStudio();
          }}
          onClose={() => {
            setPicker(false);
            requestAnimationFrame(() => choose.current?.focus({ preventScroll: true }));
            repaintStudio();
          }}
          returnFocus={choose.current}
        />
      )}
    </section>
  );
}
