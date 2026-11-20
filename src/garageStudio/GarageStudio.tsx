import { useMatchedCar } from './matchedSwap';
import { StudioLoading } from './StudioLoading';
import { isMechanical } from '../garageExhibits/mechanical';
import { StudioChapters } from './StudioChapters';
import { exhibitNames, useGarageExhibit } from '../garageExhibits/state';
import { exhibitLink } from '../garageExhibits/select';
import { StudioPhotoControls } from './StudioPhotoControls';
import { StudyControls, StudioInvitation } from '../garageStudy/StudyControls';
import { useGarageStudy } from '../garageStudy/state';
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { ControlIcon } from '../ui/ControlIcon';
import { StudioCarPicker } from './StudioCarPicker';
import { useDialogFocus } from '../ui/useDialogFocus';
import { usePageScrollLock } from '../ui/usePageScrollLock';
import { copyText } from '../browserSharing';
import { useLineup } from '../lineup/state';
import {
  chapters,
  photoRatio,
  repaintStudio,
  shotUrl,
  useGarageStudio,
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
  const { chapter, proposed, photo, study, close, select } = useGarageStudio();
  const id = useAppStore((s) => s.carIndex);
  const loading = useAppStore((s) => s.isCarLoading);
  const error = useAppStore((s) => s.carLoadError);
  const swap = useMatchedCar(id, loading, error);
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
  const exhibit = useGarageExhibit((state) => state.exhibit);
  const porsche = useGarageExhibit((state) => state.exhibit === 'porsche' && state.after);
  const pair = chapter === 'lineup';
  const car = CARS[id];
  const waiting = pair
    ? pairReady !== 'ready'
    : loading || !!error || (swap !== null && swap.incoming !== id);
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
    const url = exhibitLink(shotUrl());
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

  const title = photo
    ? 'Photo mode'
    : study
      ? 'Behind the render'
      : exhibit === 'free'
        ? chapters[chapter]
        : exhibitNames[exhibit];
  const subtitle = pair
    ? exhibit === 'wings'
      ? 'Red Bull RB16B & Ferrari F1-75'
      : porsche
        ? '911 Turbo (930) & 911 RWB'
        : 'Ferrari F40 & Red Bull RB16B'
    : CARS[swap?.outgoing ?? id].name;
  return (
    <section
      ref={dialog}
      className="garage-studio"
      aria-label="Garage Studio"
      aria-modal="true"
      role="dialog"
      data-live-scene
      data-chapter={chapter}
      data-exhibit={exhibit}
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
        <StudioLoading
          car={swap?.incoming ?? id}
          pair={pair}
          pairFailed={pairReady === 'failed' && pair}
          error={error}
          matched={swap !== null}
          still={swap?.still}
        />
      )}
      <footer className="garage-studio-footer">
        {!photo && !study && <StudioInvitation dragging={dragging} />}
        <div className="garage-studio-dock">
          <StudioChapters chapter={chapter} onSelect={selectChapter} />

          {!photo && !study && !isMechanical(exhibit) && <StudioViews waiting={waiting} />}

          {photo && (
            <StudioPhotoControls
              photo={photo}
              busy={busy}
              waiting={waiting}
              file={image?.file}
              onRetake={() => setImage(null)}
              onCapture={takePhoto}
              onDone={leaveTool}
            />
          )}

          {study && <StudioStudy study={study} onSelect={setStudy} onDone={leaveTool} />}

          {!photo && !study && (
            <div className="garage-studio-row studio-tools" aria-label="Garage tools" role="group">
              <button
                ref={choose}
                disabled={pair || (swap !== null && !error)}
                onClick={() => setPicker(true)}
              >
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
      {picker && <StudioCarPicker onClose={() => setPicker(false)} returnFocus={choose.current} />}
    </section>
  );
}
