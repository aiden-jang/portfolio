import { useEffect, useRef, useState } from 'react';
import { CARS } from '../../config';
import { paintFinish } from '../../paint';
import { useAppStore } from '../../store';
import { CAMERA_VIEWS, type CameraView } from '../../three/cameraViews';
import { CarZoomControls } from '../CarZoomControls';
import { usePageScrollLock } from '../usePageScrollLock';
import { useDialogFocus } from '../useDialogFocus';
import { SCENE_ACTIVITY_EVENT } from '../../three/useSceneActivity';
import { usePhotoMode } from './state';
import { captureScene } from './capture';
import { downloadPhoto, makePostcard } from './postcard';
import './photo.css';

export function PhotoMode() {
  const active = usePhotoMode((s) => s.active),
    close = usePhotoMode((s) => s.close);
  const section = useAppStore((s) => s.sectionIndex),
    unavailable = useAppStore((s) => s.sceneUnavailable),
    loading = useAppStore((s) => s.isCarLoading),
    error = useAppStore((s) => s.carLoadError);
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(''),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState('');
  const region = useRef<HTMLElement>(null),
    exit = useRef<HTMLButtonElement>(null),
    generation = useRef({ version: 0 });
  usePageScrollLock(active);
  useDialogFocus(active, region, exit);
  useEffect(() => {
    if (section !== 0 || unavailable || loading || error) close();
  }, [section, unavailable, loading, error, close]);
  useEffect(() => {
    if (!active) return;
    const session = generation.current;
    document.body.dataset.photoMode = 'true';
    window.dispatchEvent(new Event(SCENE_ACTIVITY_EVENT));
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
      } else if (event.key !== 'Tab') event.stopPropagation();
    };
    window.addEventListener('keydown', key, true);
    return () => {
      delete document.body.dataset.photoMode;
      window.removeEventListener('keydown', key, true);
      session.version++;
      setFile(null);
      setBusy(false);
      setNotice('');
      queueMicrotask(() =>
        Array.from(document.querySelectorAll<HTMLButtonElement>('[aria-label="All controls"]'))
          .find((button) => button.getClientRects().length)
          ?.focus({ preventScroll: true }),
      );
    };
  }, [active, close]);
  useEffect(() => {
    if (!file) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!active) return null;
  const capture = async () => {
    const version = ++generation.current.version;
    setBusy(true);
    setNotice('');
    const state = useAppStore.getState(),
      car = CARS[state.carIndex];
    try {
      const image = await captureScene();
      const result = await makePostcard(
        image,
        car.name,
        `${paintFinish(car, state.activeBodyColor).name} · ${state.themeName === 'night' ? 'Night' : 'Dusk'}`,
      );
      if (version === generation.current.version) setFile(result);
    } catch (e) {
      if (version === generation.current.version)
        setNotice(e instanceof Error ? e.message : 'Capture failed. Try again.');
    } finally {
      if (version === generation.current.version) setBusy(false);
    }
  };
  const share = async () => {
    if (!file) return;
    const version = generation.current.version;
    try {
      await navigator.share({ files: [file], title: 'My showroom' });
      if (version === generation.current.version) setNotice('Photo shared.');
    } catch (e) {
      if (
        version === generation.current.version &&
        !(e instanceof Error && e.name === 'AbortError')
      )
        setNotice('Sharing is unavailable. Use Save image instead.');
    }
  };
  return (
    <section ref={region} className="photo-mode" role="region" aria-label="Photo mode">
      {preview && (
        <div className="photo-preview">
          <img src={preview} alt="Your showroom postcard" />
        </div>
      )}
      <div className="photo-toolbar">
        <div className="photo-actions">
          <button ref={exit} onClick={close}>
            Exit photo mode
          </button>
          {!file && (
            <>
              <select
                aria-label="Camera view"
                defaultValue=""
                onChange={(event) =>
                  useAppStore.getState().setCameraView(event.target.value as CameraView)
                }
              >
                <option value="" disabled>
                  Camera view
                </option>
                {Object.entries(CAMERA_VIEWS).map(([id, view]) => (
                  <option key={id} value={id}>
                    {view.label}
                  </option>
                ))}
              </select>
              <CarZoomControls />
            </>
          )}
          {file ? (
            <>
              <button
                onClick={() => {
                  setFile(null);
                  setNotice('');
                }}
              >
                Retake
              </button>
              <button
                onClick={() => {
                  downloadPhoto(file);
                  setNotice('Image downloaded.');
                }}
              >
                Save image
              </button>
              {navigator.canShare?.({ files: [file] }) && (
                <button onClick={() => void share()}>Share image</button>
              )}
            </>
          ) : (
            <button disabled={busy} onClick={() => void capture()}>
              {busy ? 'Capturing…' : 'Capture photo'}
            </button>
          )}
        </div>
        <p role="status">
          {notice ||
            (file
              ? 'Your postcard is ready.'
              : busy
                ? 'Preparing your postcard…'
                : 'Drag to frame your shot. On touch, hold the car first.')}
        </p>
      </div>
    </section>
  );
}
