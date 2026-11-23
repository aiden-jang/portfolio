import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`Intro, brand and Reset view replay the camera at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.route('**/projects/globe-geography.bin.gz', (route) => route.abort());
    await page.goto('/');

    const playing = page.getByRole('button', { name: 'Pause opening camera' });
    const homepage = page.getByRole('button', { name: 'Aiden Jang, back to the top' });
    const selectIntro = async () => {
      const nav = page.getByRole('navigation', { name: 'Mobile navigation' });
      if (width < 768) {
        await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
        await nav.getByRole('link', { name: 'Intro', exact: true }).click();
      } else {
        await page.locator('#nav').getByRole('link', { name: 'Intro', exact: true }).click();
      }
    };
    await expect(playing).toBeVisible({ timeout: 60_000 });
    await page.locator('#sec-work').evaluate((section) => section.scrollIntoView());
    await expect(playing).toHaveCount(0);
    await selectIntro();
    await expect(playing).toBeVisible();
    await playing.click();
    await selectIntro();
    await expect(playing).toBeVisible();
    await playing.click();
    await homepage.click();
    await expect(playing).toBeVisible();

    const dock = page.locator(width < 768 ? '#mobile-bar' : '#desktop-dock');
    const zoom = dock.getByRole('button', { name: 'Zoom in', exact: true });
    const firstPosition = await zoom.boundingBox();
    await zoom.click();
    const reset = dock.getByRole('button', { name: 'Reset view' });
    await expect(reset).toBeVisible();
    expect(await zoom.boundingBox()).toEqual(firstPosition);
    await reset.click();
    await expect(reset).toBeEnabled();
    await expect(playing).toBeVisible();

    await playing.click();
    await reset.click();
    await expect(playing).toBeVisible();

    let finishLoad!: () => void;
    const loading = new Promise<void>((resolve) => {
      finishLoad = resolve;
    });
    await page.route('**/models/ferrari-f1-75.glb', async (route) => {
      await loading;
      await route.continue();
    });
    try {
      await dock.getByRole('button', { name: 'Next car', exact: true }).click();
      await expect(reset).toBeDisabled();
      await expect(playing).toHaveCount(0);
    } finally {
      finishLoad();
    }
    await expect(reset).toBeEnabled({ timeout: 60_000 });
    await expect(playing).toBeVisible();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await zoom.click();
    await reset.click();
    await expect(reset).toBeEnabled();
    await selectIntro();
    await homepage.click();
    await expect(playing).toHaveCount(0);
  });
}
