import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';

test('Contact shows its fixed car and email while the F40 is loading', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let release!: () => void;
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/models/ferrari-f120-f40.glb', async (route) => {
    await held;
    await route.continue();
  });
  await page.goto('/#sec-contact', { waitUntil: 'domcontentloaded' });
  const poster = page.locator('#sec-contact .contact-poster img');
  try {
    await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
    await expect.poll(() => poster.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(390);
    await expect(page.locator('.car-loading-progress')).toBeHidden();
    await page.getByRole('link', { name: /me@aidenjang.com/ }).click({ trial: true });
  } finally {
    release();
  }
  await expect(poster).toHaveCount(0);
});

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test(`the F40 fallback holds through the Contact handoff at ${width} × ${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl')) return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#f40-study', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready.then(() => {}));
    const track = page.locator('.scroll-film-track');
    const contact = page.locator('#sec-contact');
    const position = (offset: number) =>
      contact.evaluate((el, distance) => {
        scrollBy({ top: el.getBoundingClientRect().top - distance, behavior: 'instant' });
      }, offset);
    const outline = async () => {
      const image = PNG.sync.read(await page.screenshot());
      const bounds = [width, height, 0, 0];
      for (let y = Math.floor(height * 0.25); y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const i = (image.width * y + x) * 4;
          const [r, g, b] = image.data.subarray(i, i + 3);
          if (r < 130 || r < g * 1.9 || r < b * 1.7) continue;
          bounds[0] = Math.min(x, bounds[0]);
          bounds[1] = Math.min(y, bounds[1]);
          bounds[2] = Math.max(x, bounds[2]);
          bounds[3] = Math.max(y, bounds[3]);
        }
      }
      expect(bounds[2] - bounds[0]).toBeGreaterThan(width * 0.32);
      return bounds;
    };
    await expect
      .poll(() => track.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(2);
    await position(height * 0.4);
    await expect(track).toHaveAttribute('data-study-matched', '');
    await expect(page.locator('body')).toHaveAttribute('data-study-poster', '');
    const held = await outline();
    await position(0);
    await expect(page.locator('body')).not.toHaveAttribute('data-study-poster');
    await expect(contact.getByRole('link', { name: /me@aidenjang.com/ })).toBeInViewport();
    const after = await outline();
    expect(Math.max(...held.map((edge, axis) => Math.abs(edge - after[axis])))).toBeLessThanOrEqual(
      2,
    );

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await track.scrollIntoViewIfNeeded();
    await track.getByRole('slider').fill('100');
    const painted = track.locator('.finish-poster-paint img');
    await expect(track.locator('.finish-poster-paint')).toHaveCSS('opacity', '1');
    await expect(track.locator('video')).not.toHaveAttribute('src', /mp4/);
    await expect
      .poll(() => painted.evaluate((img: HTMLImageElement) => img.currentSrc))
      .toBe(
        await contact
          .locator('.contact-poster img')
          .evaluate((img: HTMLImageElement) => img.currentSrc),
      );
  });
}

test('a failed car download preserves the portfolio and can retry the original model', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/models/ferrari-f120-f40.glb', (route) => {
    requests++;
    return requests === 1 ? route.fulfill({ status: 503, body: 'Unavailable' }) : route.continue();
  });
  await page.goto('/?car=0');
  const notice = page.getByRole('alert').filter({ hasText: /Couldn.t load Ferrari F40/ });
  await expect(notice).toBeVisible({ timeout: 60_000 });
  await expect(page.locator('#sec-intro')).toBeVisible();
  await notice.getByRole('button', { name: 'Retry car', exact: true }).click();
  await expect(notice).toHaveCount(0);
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  expect(requests).toBe(2);
  await expect(
    page.getByRole('button', { name: /Browse cars. Ferrari F40/ }).filter({ visible: true }),
  ).toBeEnabled();
});
