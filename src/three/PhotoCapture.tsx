import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { CAPTURE_EVENT, type CaptureRequest } from '../ui/photo/capture';

export function PhotoCapture() {
  const { gl, invalidate } = useThree();
  const request = useRef<CaptureRequest | null>(null);
  useEffect(() => {
    const capture = (event: Event) => {
      request.current?.reject(new Error('A newer capture replaced this one.'));
      request.current = (event as CustomEvent<CaptureRequest>).detail;
      request.current.accept();
      invalidate();
    };
    window.addEventListener(CAPTURE_EVENT, capture);
    return () => {
      window.removeEventListener(CAPTURE_EVENT, capture);
      request.current?.reject(new Error('The showroom is unavailable.'));
    };
  }, [gl, invalidate]);
  useFrame(() => {
    const pending = request.current;
    if (!pending) return;
    request.current = null;
    // Read after this frame's scene/effects passes, before the browser clears the drawing buffer.
    queueMicrotask(() => {
      try {
        gl.domElement.toBlob(
          (blob) =>
            blob ? pending.resolve(blob) : pending.reject(new Error('Capture failed. Try again.')),
          'image/png',
        );
      } catch {
        pending.reject(new Error('Capture is unavailable. Try again.'));
      }
    });
  });
  return null;
}
