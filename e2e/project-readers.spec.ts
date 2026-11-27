import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test.describe('Project notes at ' + width, () => {
    test.use({ viewport: { width, height }, hasTouch: width < 700, isMobile: width < 700 });
    test('both sign-in screenshots, tools and captions fit their panel', async ({ page }) => {
      await page.goto('/#work/platform');
      const pair = page.locator('.work-story .preview-sequence');
      for (const title of ['Choose an app', 'Already signed in']) {
        await pair.getByRole('button', { name: title, exact: true }).click();
        const panel = (await pair.boundingBox())!;
        const stage = (await pair.locator('.preview-sequence-stage').boundingBox())!;
        const tools = (await pair.locator('.preview-sequence-tools').boundingBox())!;
        const caption = (await pair.locator('figcaption').boundingBox())!;
        expect(tools.y).toBeGreaterThanOrEqual(stage.y + stage.height - 1);
        expect(caption.y + caption.height).toBeLessThanOrEqual(panel.y + panel.height + 1);
        const inspect = pair.getByRole('button', { name: 'Inspect screenshot: ' + title });
        const button = (await inspect.boundingBox())!;
        expect(button.x + button.width).toBeLessThanOrEqual(panel.x + panel.width + 1);
        await inspect.click();
        await page.locator('dialog[open]').press('Escape');
        await expect(inspect).toBeFocused();
      }
      await page.goto('/#work/wherever');
      const trigger = page.locator('.story-image-trigger').first();
      const icon = (await trigger.locator('svg').boundingBox())!;
      expect(icon.width).toBeLessThanOrEqual(24);
      expect(icon.height).toBeLessThanOrEqual(24);
    });
    test('Garage holds the selected car still until the first rendered frame', async ({ page }) => {
      let resume!: () => void;
      const hold = new Promise<void>((resolve) => {
        resume = resolve;
      });
      const modelRequest = page.waitForRequest('**/models/*.glb');
      await page.route('**/models/*.glb', async (route) => {
        await hold;
        await route.continue();
      });
      try {
        await page.goto('/?garage=studio&car=20&paint=original&light=night', {
          waitUntil: 'domcontentloaded',
        });
        await modelRequest;
        const studio = page.locator('.garage-studio'),
          still = studio.locator('.garage-arrival-poster img');
        const size = width >= 768 ? 'desktop' : height < 700 ? 'short' : 'phone';
        await expect(studio).toHaveAttribute('data-ready', 'false');
        await expect(still).toBeVisible();
        await expect
          .poll(() =>
            still.evaluate((image) => {
              const img = image as HTMLImageElement;
              return img.complete && img.naturalWidth > 0 ? new URL(img.currentSrc).pathname : '';
            }),
          )
          .toBe('/showroom/garage-entry/night-' + size + '.webp');
        resume();
        await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 90_000 });
        await expect(still).toHaveCount(0);
      } finally {
        resume();
      }
    });
    test('opening a reading link fetches the car only when returning to Intro', async ({
      page,
    }) => {
      const files: string[] = [];
      await page.route('**/models/*.glb', (route) => {
        files.push(new URL(route.request().url()).pathname);
        return route.abort();
      });
      for (const hash of ['#work/platform', '#project-bloomnote']) {
        await page.goto('/' + hash);
        await expect(
          page.locator(hash === '#work/platform' ? '.work-story' : hash),
        ).toBeInViewport();
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('.portfolio-scene')).toHaveCount(0);
        await expect(page.locator('.car-choice-status')).toHaveCount(0);
        expect(files).toEqual([]);
      }
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect.poll(() => files).toContain('/models/corvette-opening.glb');
    });
  });
}
