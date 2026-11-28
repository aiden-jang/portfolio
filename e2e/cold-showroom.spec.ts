import { expect, test } from '@playwright/test';

test('a late showroom import waits for a return to the Corvette', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  let resume!: () => void;
  const held = new Promise<void>((resolve) => (resume = resolve));
  const sceneRequest = page.waitForRequest(/\/Scene-[\w-]+\.js$/);
  await page.route(/\/Scene-[\w-]+\.js$/, async (route) => {
    await held;
    await route.continue();
  });
  let modelRequests = 0;
  await page.route('**/models/corvette-opening.glb', (route) => {
    modelRequests++;
    return route.abort();
  });
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const chunk = await sceneRequest;
    await page.locator('#sec-work').evaluate((el) => el.scrollIntoView({ behavior: 'instant' }));
    await expect(page.locator('html')).not.toHaveAttribute('data-before-globe-cut');
    resume();
    await page.evaluate(async (url) => {
      await import(url);
      for (let i = 0; i < 8; i++) await new Promise(requestAnimationFrame);
    }, chunk.url());
    await expect(page.locator('.portfolio-scene canvas')).toHaveCount(0);
    expect(modelRequests).toBe(0);

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.opening-poster img')).toBeVisible();
    await expect.poll(() => modelRequests).toBe(1);
  } finally {
    resume();
  }
});
