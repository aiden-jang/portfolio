import type { Page } from '@playwright/test';
import { PNG } from 'pngjs';
import { CAPTURE_EVENT } from '../src/ui/photo/capture';

export async function captureShowroom(page: Page, frameTimeout = 8000) {
  const frame = await page.evaluate(
    ({ eventName, frameTimeout }) =>
      new Promise<string>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error('No showroom frame')),
          frameTimeout,
        );
        window.dispatchEvent(
          new CustomEvent(eventName, {
            detail: {
              resolve(blob: Blob) {
                window.clearTimeout(timeout);
                const reader = new FileReader();
                reader.onload = () => resolve(String(reader.result));
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(blob);
              },
              reject(error: Error) {
                window.clearTimeout(timeout);
                reject(error);
              },
            },
          }),
        );
      }),
    { eventName: CAPTURE_EVENT, frameTimeout },
  );
  return PNG.sync.read(Buffer.from(frame.slice(frame.indexOf(',') + 1), 'base64'));
}
