export const CAPTURE_EVENT = 'portfolio:capture-photo';
export type CaptureRequest = { resolve: (blob: Blob) => void; reject: (error: Error) => void };
export function captureScene(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error('The showroom could not capture this frame. Try again.')),
      10000,
    );
    window.dispatchEvent(
      new CustomEvent<CaptureRequest>(CAPTURE_EVENT, {
        detail: {
          resolve: (blob) => {
            clearTimeout(timer);
            resolve(blob);
          },
          reject: (error) => {
            clearTimeout(timer);
            reject(error);
          },
        },
      }),
    );
  });
}
