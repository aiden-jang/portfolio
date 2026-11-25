import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
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
});

for (const [width, format, videoWidth] of [
  [1440, 'desktop', 1440],
  [390, 'phone', 720],
] as const) {
  test(`About plays the responsive reel on demand at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
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
    await expect(video).toHaveJSProperty('controls', false);
    await expect
      .poll(() => video.evaluate((player: HTMLVideoElement) => player.currentTime))
      .toBeGreaterThan(0);
    await expect(reel.getByRole('button', { name: 'Pause reel' })).toBeFocused();

    await expect(video).toBeInViewport();
    await reel.getByRole('button', { name: 'Pause reel' }).press('Enter');
    await expect(video).toHaveJSProperty('paused', true);
    await reel.getByRole('button', { name: 'Resume reel' }).press('Enter');
    await video.evaluate((player: HTMLVideoElement) => {
      player.playbackRate = 4;
    });
    const replay = reel.getByRole('button', { name: 'Replay reel' });
    await expect(replay).toBeFocused();
    await video.evaluate((player: HTMLVideoElement) => {
      player.playbackRate = 1;
    });
    await replay.press('Enter');
    await expect(video).toHaveJSProperty('controls', false);
    await expect
      .poll(() => video.evaluate((player: HTMLVideoElement) => player.currentTime))
      .toBeLessThan(5);
    await expect(video).toHaveJSProperty('paused', false);
    await page.getByRole('button', { name: 'Aiden Jang, back to the top' }).click();
    await expect(video).not.toBeInViewport();
    await expect(video).toHaveJSProperty('paused', true);
  });
}

test('the reel keeps playing at the viewport edge and resumes after leaving it', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#sec-about');
  const video = page.locator('.about-reel-stage video');
  await video.scrollIntoViewIfNeeded();
  await expect(video).toHaveJSProperty('paused', false);
  await expect(video).toHaveJSProperty('loop', true);

  const holdTarget = page.getByRole('button', { name: 'Pause reel', exact: true });
  await holdTarget.scrollIntoViewIfNeeded();
  const stage = await holdTarget.boundingBox();
  expect(stage).not.toBeNull();
  await page.mouse.move(stage!.x + stage!.width / 2, stage!.y + stage!.height / 2);
  await page.mouse.down();
  await expect(video).toHaveJSProperty('paused', true);
  const held = await video.evaluate((player: HTMLVideoElement) => player.currentTime);
  await page.waitForTimeout(160);
  await expect(video).toHaveJSProperty('currentTime', held);
  await page.mouse.up();
  await expect(video).toHaveJSProperty('paused', false);
  await expect
    .poll(() => video.evaluate((player: HTMLVideoElement) => player.currentTime))
    .toBeGreaterThan(held);
  const scrollToVisibleHeight = (height: number) =>
    video.evaluate((player, height) => {
      scrollBy({
        top: player.getBoundingClientRect().top - innerHeight + height,
        behavior: 'instant',
      });
    }, height);
  await scrollToVisibleHeight(32);
  await expect(video).toBeInViewport();
  const time = () => video.evaluate((player: HTMLVideoElement) => player.currentTime);
  const partlyVisible = await time();
  await expect.poll(time).toBeGreaterThan(partlyVisible + 0.2);
  await scrollToVisibleHeight(-32);
  await expect(video).not.toBeInViewport();
  await expect(video).toHaveJSProperty('paused', true);
  await video.evaluate((player: HTMLVideoElement) => {
    player.currentTime = 5;
  });
  await scrollToVisibleHeight(32);
  await expect(video).toHaveJSProperty('paused', false);
  await expect.poll(time).toBeGreaterThan(5);
});
