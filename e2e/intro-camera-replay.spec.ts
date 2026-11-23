import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`Intro, brand and one camera control replay the camera at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.route('**/projects/globe-geography.bin.gz', (route) => route.abort());
    await page.goto('/');

    const camera = page.locator('.opening-loop-control');
    const playing = page.getByRole('button', { name: 'Pause opening camera' });
    const paused = page.getByRole('button', { name: 'Resume opening camera' });
    const restart = page.getByRole('button', { name: 'Restart camera' });
    const dock = page.locator(width < 768 ? '#mobile-bar' : '#desktop-dock');
    const zoom = dock.getByRole('button', { name: 'Zoom in', exact: true });
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
    await expect(dock.getByRole('button', { name: 'Reset view', exact: true })).toHaveCount(0);
    const position = await camera.boundingBox();
    const zoomPosition = await zoom.boundingBox();
    await playing.click();
    await expect(paused).toBeVisible();
    expect(await camera.boundingBox()).toEqual(position);
    await paused.press('Enter');
    await expect(playing).toBeFocused();

    await page.locator('#sec-work').evaluate((section) => section.scrollIntoView());
    await expect(camera).toBeHidden();
    await selectIntro();
    await expect(playing).toBeVisible();
    await playing.click();
    await homepage.click();
    await expect(playing).toBeVisible();

    await zoom.click();
    await expect(restart).toBeVisible();
    expect(await camera.boundingBox()).toEqual(position);
    expect(await zoom.boundingBox()).toEqual(zoomPosition);
    await restart.click();
    await expect(playing).toBeVisible();

    await page.mouse.move(width / 2, 450);
    await page.mouse.down();
    await page.mouse.move(width / 2 + 54, 450, { steps: 4 });
    await page.mouse.up();
    await expect(restart).toBeEnabled();
    await restart.click();
    await expect(playing).toBeVisible();

    let finishLoad!: () => void;
    const loading = new Promise<void>((resolve) => {
      finishLoad = resolve;
    });
    await page.route('**/models/mazda-mx5-na.glb', async (route) => {
      await loading;
      await route.continue();
    });
    try {
      await dock.getByRole('button', { name: /Browse cars\./ }).click();
      await page
        .getByRole('dialog', { name: 'Pick your ride.' })
        .getByRole('button', { name: 'Show Mazda MX-5 Miata, NA' })
        .click();
      await expect(restart).toBeDisabled();
    } finally {
      finishLoad();
    }
    await expect(playing).toBeEnabled({ timeout: 60_000 });

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(camera).toBeHidden();
    await zoom.click();
    const restore = page.getByRole('button', { name: 'Restore default view' });
    await restore.press('Enter');
    await expect(restore).toBeFocused();
    await zoom.focus();
    await expect(camera).toBeHidden();
    await homepage.click();
    await expect(camera).toBeHidden();
  });
}
