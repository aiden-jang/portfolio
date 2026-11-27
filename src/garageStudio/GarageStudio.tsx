import { StudioTour } from './StudioTourPanel';
import { restoreStudioFocus } from './restoreStudioFocus';
import { useMatchedCar } from './matchedSwap';
import { GarageArrivalPoster } from './GarageArrivalPoster';
import { StudioLoading } from './StudioLoading';
import { isMechanical } from '../garageExhibits/mechanical';
import { StudioChapters } from './StudioChapters';
import { exhibitNames, useGarageExhibit } from '../garageExhibits/state';
import { exhibitLink } from '../garageExhibits/select';
import { StudioPhotoControls } from './StudioPhotoControls';
import { StudioCompactDock, StudioTools } from './StudioCompactDock';
import { StudyControls, StudioInvitation } from '../garageStudy/StudyControls';
import { useGarageStudy } from '../garageStudy/state';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEventHandler,
} from 'react';
import { CARS } from '../config';
import { useAppStore } from '../store';
import { StudioHeading } from './StudioHeading';
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
import { captureScene } from '../ui/photo/capture';
import { StudioPhotoReview } from './StudioPhotoReview';
import { StudioOrbit } from './StudioOrbit';
import { StudioViews } from './StudioViews';
import { StudioStudy } from './StudioStudy';
import { studioPrintDetails } from './printDetails';
import { StudioShotLink } from './StudioShotLink';
import './garage-studio.css';
import './compact-studio.css';
import '../ui/car-picker.css';

export function GarageStudio() {
  const { chapter, proposed, photo, study, close, select, firstFrameShown } = useGarageStudio();
  const id = useAppStore((s) => s.carIndex);
  const loading = useAppStore((s) => s.isCarLoading);
  const error = useAppStore((s) => (s.sceneUnavailable ? '3D view unavailable.' : s.carLoadError));
  const swap = useMatchedCar(id, loading, error);
  const pairReady = useLineup((s) => s.status);
  const dialog = useRef<HTMLElement>(null);
  const exit = useRef<HTMLButtonElement>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [pickerTrigger, setPickerTrigger] = useState<HTMLButtonElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const shareVersion = useRef(0);
  const [notice, setNotice] = useState('');
  const captureVersion = useRef(0);
  const [busy, setBusy] = useState(false);
  const [image, setImage] = useState<{ src: string; frame: Blob } | null>(null);
  const [link, setLink] = useState('');
  const exhibit = useGarageExhibit((state) => state.exhibit);
  const louvers = useGarageExhibit((state) => state.louvers);
  const porsche = useGarageExhibit((state) => state.exhibit === 'porsche' && state.after);
  const pair = chapter === 'lineup';
  const car = CARS[id];
  const waiting = pair
    ? pairReady !== 'ready'
    : !firstFrameShown || loading || !!error || (swap !== null && swap.incoming !== id);
  const canChoose = !pair;
  const openPicker: MouseEventHandler<HTMLButtonElement> = (event) =>
    setPickerTrigger(event.currentTarget);
  usePageScrollLock(true);
  useDialogFocus(!pickerTrigger, dialog, exit);
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
      queueMicrotask(restoreStudioFocus);
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
      const frame = await captureScene();
      if (version !== captureVersion.current) return;
      setImage({ src: URL.createObjectURL(frame), frame });
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
      : louvers
        ? 'Rear louvers'
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
      data-controls-open={controlsOpen}
      data-studio-tool={photo || study ? 'active' : undefined}
      data-dragging={dragging}
      data-photo-review={image ? 'true' : undefined}
    >
      {!firstFrameShown && !pair && !swap && <GarageArrivalPoster car={id} />}
      <StudioOrbit enabled={!waiting && !image} onDrag={setDragging} />
      <StudioHeading
        title={title}
        car={subtitle}
        incoming={swap && waiting && !error ? swap.incoming : undefined}
        leadWithCar={exhibit === 'free' && !photo && !study && !pair && chapter !== 'light'}
        exit={exit}
        onExit={() => {
          leaveTool();
          close();
        }}
      />
      {photo && !image && (
        <div
          className="studio-photo-guide"
          style={{ '--photo-ratio': photoRatio(photo) } as CSSProperties}
          aria-hidden="true"
        />
      )}
      {waiting && (!swap || error) && (
        <StudioLoading
          car={swap?.incoming ?? id}
          pair={pair}
          pairFailed={pairReady === 'failed' && pair}
          error={error}
          matched={swap !== null}
          outgoing={swap ? CARS[swap.outgoing].name : undefined}
          still={swap?.still}
        />
      )}
      <footer className="garage-studio-footer">
        <StudioTour waiting={waiting} />
        {!photo && !study && (
          <>
            {louvers ? (
              <p className="studio-invitation">Drag sideways to look through the slats</p>
            ) : (
              <StudioInvitation dragging={dragging} />
            )}
            <StudioCompactDock
              waiting={waiting}
              canChoose={canChoose}
              expanded={controlsOpen}
              onChoose={openPicker}
              onToggle={() => setControlsOpen((open) => !open)}
            />
          </>
        )}
        <div className="garage-studio-dock" id="studio-full-dock">
          {!photo && !study && <StudyControls waiting={waiting} />}
          {!image && <StudioChapters chapter={chapter} onSelect={selectChapter} />}
          {!photo && !study && !isMechanical(exhibit) && <StudioViews waiting={waiting} />}
          {photo && !image && (
            <StudioPhotoControls
              photo={photo}
              busy={busy}
              waiting={waiting}
              onCapture={takePhoto}
              onDone={leaveTool}
            />
          )}
          {study && <StudioStudy study={study} onSelect={setStudy} onDone={leaveTool} />}
          {!photo && !study && (
            <StudioTools
              waiting={waiting}
              pair={pair}
              canChoose={canChoose}
              onChoose={openPicker}
              onPhoto={() => {
                useGarageStudy.setState({ playing: false });
                useGarageStudio.setState({ photo: 'portrait' });
                repaintStudio();
              }}
              onShare={() => void share()}
              onStudy={() => setStudy('finished')}
            />
          )}
          {notice && (
            <p className="studio-tool-note" role="status">
              {notice}
            </p>
          )}
          {link && !photo && !study && <StudioShotLink value={link} onClose={dismissLink} />}
        </div>
      </footer>
      {photo && image && (
        <StudioPhotoReview
          image={image}
          shape={photo}
          name={pair ? 'lineup' : car.file.replace('.glb', '')}
          print={studioPrintDetails(id, chapter, subtitle)}
          onShape={(shape) => useGarageStudio.setState({ photo: shape })}
          onRetake={() => setImage(null)}
          onDone={leaveTool}
        />
      )}
      {pickerTrigger && (
        <StudioCarPicker
          matched={chapter === 'walk' && exhibit === 'free'}
          onClose={() => setPickerTrigger(null)}
          returnFocus={pickerTrigger}
        />
      )}
    </section>
  );
}
