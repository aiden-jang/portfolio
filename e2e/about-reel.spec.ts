import { expect, test } from '@playwright/test';

for (const [width, format, videoWidth] of [
  [1440, 'desktop', 1440],
  [390, 'phone', 720],
] as const) {
  test(`About plays the responsive reel on demand at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext as (
        this: HTMLCanvasElement,
        type: string,
        options?: unknown,
      ) => RenderingContext | null;
      Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
        value(this: HTMLCanvasElement, type: string, options?: unknown) {
          return type.startsWith('webgl') ? null : getContext.call(this, type, options);
        },
      });
    });
    await page.goto('/#sec-about');
    const reel = page.getByRole('figure', { name: 'Selected work in motion' });
    await expect(reel).toBeVisible();
    const video = reel.locator('video');
    await expect(video).toHaveJSProperty('currentSrc', '');
    const poster = reel.locator('img');
    await poster.scrollIntoViewIfNeeded();
    await expect
      .poll(() => poster.evaluate((img: HTMLImageElement) => img.currentSrc))
      .toContain(`reel-${format}.jpg`);

    await page.route(`**/reel-${format}.mp4`, (route) => route.abort(), { times: 1 });
    await reel.getByRole('button', { name: 'Play reel' }).press('Enter');
    const retry = reel.getByRole('button', { name: 'Retry reel' });
    await expect(retry).toBeVisible();
    await retry.press('Enter');
    await expect(video).toHaveJSProperty('duration', 12);
    await expect(video).toHaveJSProperty('videoWidth', videoWidth);
    await expect(video).toHaveJSProperty('controls', true);
    await expect
      .poll(() => video.evaluate((player: HTMLVideoElement) => player.currentTime))
      .toBeGreaterThan(0);
    await expect(video).toBeFocused();

    await expect(video).toBeInViewport();
    await video.evaluate((player: HTMLVideoElement) => {
      player.playbackRate = 4;
    });
    const replay = reel.getByRole('button', { name: 'Replay reel' });
    await expect(replay).toBeFocused();
    await video.evaluate((player: HTMLVideoElement) => {
      player.playbackRate = 1;
    });
    await replay.press('Enter');
    await expect(video).toHaveJSProperty('controls', true);
    await expect
      .poll(() => video.evaluate((player: HTMLVideoElement) => player.currentTime))
      .toBeLessThan(5);
    await expect(video).toHaveJSProperty('paused', false);
    await page.getByRole('button', { name: 'Aiden Jang, back to the top' }).click();
    await expect(video).not.toBeInViewport();
    await expect(video).toHaveJSProperty('paused', true);
  });
}
