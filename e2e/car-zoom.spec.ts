import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

async function carArea(page: Page) {
  const { data, width, height } = PNG.sync.read(await page.screenshot({ timeout: 5000 }));
  let red = 0;
  for (let y = Math.floor(height * 0.22); y < height * 0.78; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const i = (y * width + x) * 4;
      if (data[i] > 60 && data[i] > data[i + 1] * 1.4 && data[i] > data[i + 2] * 1.4) red++;
    }
  }
  return red;
}

for (const width of [1440, 390, 320]) {
  test.describe(`${width}px car zoom`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: width < 768 });

    test('zooms with bounded controls, resets, scrolls normally and keeps Contact fixed', async ({
      page,
      browserName,
    }) => {
      await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
      await page.route('**/_vercel/**', (route) =>
        route.fulfill({ body: '', contentType: 'application/javascript' }),
      );
      await page.goto('/?car=0');
      const dock = page.locator(width < 768 ? '#mobile-bar' : '#desktop-dock');
      const zoomIn = dock.getByRole('button', { name: 'Zoom in', exact: true });
      const zoomOut = dock.getByRole('button', { name: 'Zoom out', exact: true });
      const reset = page.getByRole('button', { name: 'Restore default view' });
      await expect(zoomIn).toBeEnabled({ timeout: 60_000 });
      await expect(async () => expect(await carArea(page)).toBeGreaterThan(1000)).toPass({
        timeout: 20_000,
      });
      const initial = await carArea(page);
      await page.screenshot({ path: test.info().outputPath('default.png') });
      for (let i = 0; i < 3; i++) {
        if (width < 768) await zoomIn.tap();
        else {
          await zoomIn.focus();
          await page.keyboard.press('Enter');
        }
      }
      await expect(zoomIn).toBeDisabled();
      await expect(reset).toBeVisible();
      await expect(async () => expect(await carArea(page)).toBeGreaterThan(initial * 1.08)).toPass({
        timeout: 20_000,
      });
      await page.screenshot({ path: test.info().outputPath('zoom-in.png') });
      await reset.press('Enter');
      await expect(reset).toBeFocused();
      await expect(async () =>
        expect(Math.abs((await carArea(page)) / initial - 1)).toBeLessThan(0.03),
      ).toPass({ timeout: 20_000 });
      await zoomOut.click();
      await zoomOut.click();
      await expect(zoomOut).toBeDisabled();
      await expect(async () => expect(await carArea(page)).toBeLessThan(initial * 0.92)).toPass({
        timeout: 20_000,
      });
      await page.screenshot({ path: test.info().outputPath('zoom-out.png') });
      for (const button of [zoomIn, zoomOut]) {
        const bounds = (await button.boundingBox())!;
        expect(bounds.width).toBeGreaterThanOrEqual(44);
        expect(bounds.height).toBeGreaterThanOrEqual(44);
        expect(bounds.x).toBeGreaterThanOrEqual(0);
        expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await page.mouse.move(width / 2, 450);
      // WebKit wheel synthesis varies by platform; exercise its keyboard scroll path.
      if (browserName === 'webkit') {
        await page.evaluate(() => {
          if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        });
        await page.keyboard.press('PageDown');
      } else await page.mouse.wheel(0, 650);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(200);
      if (width < 768) {
        await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name: 'Contact', exact: true })
          .click();
      } else await page.locator('#nav').getByRole('link', { name: 'Contact', exact: true }).click();
      await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
      await expect(zoomIn).toHaveCount(0);
      await expect(reset).toHaveCount(0);
      await page.mouse.move(width / 2, 520);
      await page.mouse.down();
      await page.mouse.move(width / 2 + 60, 560, { steps: 4 });
      await expect(page.locator('body')).not.toHaveClass(/orbiting/);
      await page.mouse.up();
      await page.screenshot({ path: test.info().outputPath('contact-fixed.png') });
    });
  });
}
