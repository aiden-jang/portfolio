import { useCallback, useEffect, useState } from 'react';
import { downloadPhoto, makePostcard } from '../ui/photo/postcard';
import { cropStudioPhoto } from './photo';
import type { PhotoShape } from './state';

export type StudioPrintDetails = { car: string; view: string; credit: string };
type Props = {
  frame: Blob;
  shape: PhotoShape;
  position: { x: number; y: number };
  name: string;
  print?: StudioPrintDetails;
};

export function StudioPrintActions({ frame, shape, position, name, print }: Props) {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [share, setShare] = useState<{ build: () => Promise<File>; file: File }>();
  const { x, y } = position;
  const car = print?.car;
  const view = print?.view;
  const credit = print?.credit;

  const build = useMemoizedExport(frame, shape, x, y, name, car, view, credit);

  useEffect(() => {
    if (!navigator.share || !navigator.canShare) return;
    let current = true;
    const timer = setTimeout(() => {
      void build().then(
        (file) => {
          if (current && navigator.canShare({ files: [file] })) setShare({ build, file });
        },
        () => {},
      );
    }, 200);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [build]);

  async function save() {
    setPending(true);
    setNotice('');
    try {
      downloadPhoto(share?.build === build ? share.file : await build());
    } catch {
      setNotice('The photo could not be saved. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="photo-save" type="button" disabled={pending} onClick={() => void save()}>
        Save photo
      </button>
      {share?.build === build && (
        <button
          type="button"
          onClick={() => {
            setNotice('');
            void navigator
              .share({ title: car ?? 'Garage Studio', files: [share.file] })
              .catch((error: unknown) => {
                if (!(error instanceof DOMException && error.name === 'AbortError'))
                  setNotice('Sharing is unavailable. Use Save photo.');
              });
          }}
        >
          Share image
        </button>
      )}
      {notice && <p role="status">{notice}</p>}
    </>
  );
}

function useMemoizedExport(
  frame: Blob,
  shape: PhotoShape,
  x: number,
  y: number,
  name: string,
  car?: string,
  view?: string,
  credit?: string,
) {
  return useCallback(async () => {
    const crop = await cropStudioPhoto(frame, shape, { x, y });
    if (car && view) return makePostcard(crop, car, view, credit);
    return new File([crop], `studio-${name}-${shape}.png`, { type: 'image/png' });
  }, [frame, shape, x, y, name, car, view, credit]);
}
