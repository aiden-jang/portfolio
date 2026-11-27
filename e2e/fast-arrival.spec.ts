import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
]) {
  test(`fast scroll still shows project motion at ${viewport.width}×${viewport.height}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      const getContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl') && this.id !== 'globe-view') return null;
        return Reflect.apply(getContext, this, [type, ...args]);
      } as typeof getContext;
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    const travelTo = (id: string, progress?: number) =>
      page.locator(id).evaluate((element, position) => {
        const pin = element.querySelector<HTMLElement>('[data-study-pin]');
        const top = element.getBoundingClientRect().top;
        const delta =
          pin && position !== undefined
            ? top -
              parseFloat(getComputedStyle(pin).top) +
              ((element as HTMLElement).offsetHeight - pin.offsetHeight) * position
            : top - innerHeight * 0.24;
        window.dispatchEvent(new WheelEvent('wheel', { deltaY: delta }));
        scrollBy({ top: delta, behavior: 'instant' });
      }, progress);

    const globe = page.locator('.orbit-feature');
    const readings = globe.getByRole('complementary', {
      name: 'Recorded Kamchatka depth readings',
    });
    const title = page.getByRole('heading', { name: 'meanwhile.', exact: true });
    await page.locator('#sec-work').evaluate((el) => {
      scrollTo({
        top: scrollY + el.getBoundingClientRect().top - innerHeight * 0.83,
        behavior: 'instant',
      });
    });
    await expect(globe).toHaveAttribute('data-globe-phase', 'ready');
    await expect(readings).toBeHidden();
    const rebound = await title.evaluate(async (element) => {
      scrollBy({ top: innerHeight * 0.14, behavior: 'instant' });
      const first = element.getBoundingClientRect().top;
      await new Promise<void>((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done())),
      );
      return Math.abs(element.getBoundingClientRect().top - first);
    });
    expect(rebound).toBeLessThan(1.5);
    await travelTo('#project-everythingisfine', 0.58);
    await expect(globe.getByRole('button', { name: 'Pause rotation' })).toBeAttached();
    await expect(readings).toHaveCSS('opacity', '1');

    const editor = page.locator('#project-iodine .recovery');
    const status = editor.getByRole('status');
    await travelTo('#project-iodine .recovery');
    await expect(editor).toBeInViewport({ ratio: 0.4 });
    await expect(status).toHaveText('Edit undone');
    await expect(status).toHaveText('Agent edit', { timeout: 4000 });
    await expect(status).toHaveText('Edit undone');

    const batch = page.getByRole('figure', { name: 'Request batching comparison' });
    await travelTo('#batching-study', 0.63);
    await expect(batch.getByText('Batching requests', { exact: true })).toBeInViewport();
    await expect(batch.getByText('1 request · 2s load time', { exact: true })).toBeInViewport();
    await expect(batch.getByText('Line items', { exact: true })).toHaveCount(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await editor.scrollIntoViewIfNeeded();
    await expect(status).toHaveText('Edit undone');
    await batch.scrollIntoViewIfNeeded();
    await expect(batch.getByText('1 request · 2s load time', { exact: true })).toBeInViewport();
  });
}
