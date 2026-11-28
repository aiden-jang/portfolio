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
    const measures = figure.locator('.batch-measure');
    const expectMeasures = async () => {
      await expect(measures.nth(0)).toHaveText('120 → 1API requests');
      await expect(measures.nth(1)).toHaveText('60sOriginal load');
      await expect(measures.nth(0)).toBeInViewport({ ratio: 1 });
      await expect(measures.nth(1)).toBeInViewport({ ratio: 1 });
    };
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
          const travel = (el as HTMLElement).offsetHeight - pin.offsetHeight;
          const trim = parseFloat(getComputedStyle(el).getPropertyValue('--batch-hold-trim')) || 0;
          const delta = top + Math.min(travel, (travel + trim) * fraction);
          if (fast) window.dispatchEvent(new WheelEvent('wheel', { deltaY: delta }));
          window.scrollBy({ top: delta, behavior: 'instant' });
        },
        { fraction, fast },
      );

    await expect(figure.getByRole('button', { includeHidden: true })).toHaveCount(0);
    await scrub(0);
    await expect(figure).toHaveAttribute('data-phase', 'before');
    await expectMeasures();
    await expect(canvas).toBeInViewport({ ratio: 0.6 });
    const start = await requestInk();
    expect(start).toBeGreaterThan(120);
    await scrub(0.36);
    await expect(figure).toHaveAttribute('data-phase', 'batching');
    await expectMeasures();
    await expect.poll(requestInk).toBeLessThan(start);
    if (viewport.width === 375) {
      const travel = await lane.evaluate(
        (el) => el.offsetHeight - el.querySelector<HTMLElement>('[data-study-pin]')!.offsetHeight,
      );
      expect(travel).toBe(307);
    }
    await scrub(0.7);
    await expect(figure).toHaveAttribute('data-phase', 'after');
    await expectMeasures();
    await expect.poll(requestInk).toBeLessThan(start * 0.68);
    await scrub(0);
    await expect(figure).toHaveAttribute('data-phase', 'before');
    await expectMeasures();
    await expect.poll(requestInk).toBeGreaterThan(start * 0.95);

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(canvas).not.toBeInViewport();
    await scrub(0.72, true);
    await expect(figure).toHaveAttribute('data-phase', 'after');
    await expectMeasures();
    await expect(canvas).toBeInViewport({ ratio: 0.6 });
    await expect.poll(requestInk).toBeLessThan(start * 0.68);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await scrub(0);
    await expect(figure).toHaveAttribute('data-phase', 'after');
    await expectMeasures();
    await expect.poll(requestInk).toBeLessThan(start * 0.68);
    await expect(figure.getByRole('button', { includeHidden: true })).toHaveCount(0);
  });
}
