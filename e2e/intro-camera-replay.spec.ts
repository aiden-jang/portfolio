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
    const homepage = page.getByRole('button', { name: 'Aiden Jang, back to the top' });
    const selectIntro = () => homepage.click();
    await expect(playing).toBeVisible({ timeout: 60_000 });
    expect(
      await page
        .locator('#sec-work')
        .evaluate((section) => section.getBoundingClientRect().top - innerHeight),
    ).toBeGreaterThanOrEqual(-1);
    await expect(dock).toHaveCSS('opacity', '1');
    await expect(dock.getByRole('button', { name: 'Reset view', exact: true })).toHaveCount(0);
    const dockPadding = await dock.locator('.car-controls-row').evaluate((row) => {
      const bounds = row.getBoundingClientRect();
      const x = bounds.x + bounds.width / 2;
      const y = bounds.y + 2;
      return { x, y, isPadding: document.elementFromPoint(x, y) === row };
    });
    expect(dockPadding.isPadding).toBe(true);
    if (width < 768) {
      const row = dock.locator('.car-controls-row');
      const touch = {
        pointerType: 'touch',
        pointerId: 9,
        isPrimary: true,
        bubbles: true,
        clientX: dockPadding.x,
        clientY: dockPadding.y,
      };
      await row.dispatchEvent('pointerdown', touch);
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      await row.dispatchEvent('pointerup', touch);
    } else {
      await page.mouse.move(dockPadding.x, dockPadding.y);
      await page.mouse.down();
      await page.evaluate(
        () => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))),
      );
      await page.mouse.up();
    }
    await expect(playing).toBeEnabled();
    const position = await camera.boundingBox();
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

    await page.mouse.move(width / 2, 450);
    await page.mouse.down();
    await page.mouse.move(width / 2 + 54, 450, { steps: 4 });
    await page.mouse.up();
    await expect(restart).toBeEnabled();
    expect(await camera.boundingBox()).toEqual(position);
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
    for (const offset of [48, 940]) {
      await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), offset);
      await expect(playing).toHaveCount(0);
      if (offset === 48) await expect(dock).toHaveCSS('opacity', '1');
      else await expect(dock).toBeHidden();
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      await expect(playing).toBeVisible();
      await expect(dock).toHaveCSS('opacity', '1');
    }

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(camera).toBeHidden();
    await page.mouse.move(width / 2, 450);
    await page.mouse.down();
    await page.mouse.move(width / 2 + 54, 450, { steps: 4 });
    await page.mouse.up();
    const restore = page.getByRole('button', { name: 'Restore default view' });
    await restore.press('Enter');
    await expect(restore).toBeFocused();
    await dock.getByRole('button', { name: /^Lighting:/ }).focus();
    await expect(camera).toBeHidden();
    await homepage.click();
    await expect(camera).toBeHidden();
  });
}
