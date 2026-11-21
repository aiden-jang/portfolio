export const CAPTURE_EVENT = 'portfolio:capture-photo';
export type CaptureRequest = {
  accept: () => void;
  resolve: (blob: Blob) => void;
  reject: (error: Error) => void;
};
export function captureScene(): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const timeout = () =>
      reject(new Error('The showroom could not capture this frame. Try again.'));
    let timer = window.setTimeout(timeout, 10_000);
    window.dispatchEvent(
      new CustomEvent<CaptureRequest>(CAPTURE_EVENT, {
        detail: {
          accept: () => {
            clearTimeout(timer);
            timer = window.setTimeout(timeout, 45_000);
          },
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
