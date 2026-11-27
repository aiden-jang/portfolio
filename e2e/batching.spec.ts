import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 1280, height: 650 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
  { width: 320, height: 568 },
  { width: 844, height: 390 },
]) {
  test(`requests merge with scroll at ${viewport.width}×${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        return type.includes('webgl') ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#sec-work', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    const lane = page.locator('#batching-study');
    const figure = lane.getByRole('figure', { name: 'Request batching comparison' });
    const label = figure.locator('.batch-caption > strong');
    const readout = figure.locator('.batch-load-time');
    const canvas = figure.locator('canvas');
    const requestInk = () =>
      canvas.evaluate((el: HTMLCanvasElement) => {
        const pixels = el.getContext('2d')!.getImageData(0, 0, el.width, el.height).data;
        let ink = 0;
        for (let i = 0; i < pixels.length; i += 4) {
          if (pixels[i + 3] > 180) ink++;
        }
        return ink;
      });
    const scrub = (fraction: number, fast = false) =>
      lane.evaluate(
        (el, { fraction, fast }) => {
          const pin = el.querySelector<HTMLElement>('[data-study-pin]')!;
          const top = el.getBoundingClientRect().top - (parseFloat(getComputedStyle(pin).top) || 0);
          const delta = top + ((el as HTMLElement).offsetHeight - pin.offsetHeight) * fraction;
          if (fast) window.dispatchEvent(new WheelEvent('wheel', { deltaY: delta }));
          window.scrollBy({ top: delta, behavior: 'instant' });
        },
        { fraction, fast },
      );

    await expect(figure.getByRole('button', { includeHidden: true })).toHaveCount(0);
    await scrub(0);
    await expect(label).toHaveText('API calls.');
    await expect(canvas).toBeInViewport({ ratio: 0.6 });
    const start = await requestInk();
    expect(start).toBeGreaterThan(120);
    await scrub(0.36);
    await expect(label).toHaveText('Batching.');
    await expect.poll(requestInk).toBeLessThan(start);
    await scrub(0.85);
    await expect(readout).toHaveText('Page load 60s → 2s');
    await expect.poll(requestInk).toBeLessThan(start * 0.68);
    await scrub(0);
    await expect(label).toHaveText('API calls.');
    await expect.poll(requestInk).toBeGreaterThan(start * 0.95);

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(canvas).not.toBeInViewport();
    await scrub(0.84, true);
    await expect(label).toHaveText('Batching.');
    await expect(canvas).toBeInViewport({ ratio: 0.6 });
    await expect.poll(requestInk).toBeLessThan(start * 0.68);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await scrub(0);
    await expect(readout).toHaveText('Page load 60s → 2s');
    await expect.poll(requestInk).toBeLessThan(start * 0.68);
    await expect(figure.getByRole('button', { includeHidden: true })).toHaveCount(0);
  });
}
