import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

function cameraControls(page: Page) {
  const garage = page
    .getByRole('button', { name: 'Garage controls', exact: true })
    .filter({ visible: true });
  const reset = page
    .getByRole('button', { name: 'Reset view', exact: true })
    .filter({ visible: true });
  const dialog = page.getByRole('dialog', { name: 'Command menu' });
  return {
    reset,
    async select(name: string) {
      await garage.click();
      await expect(dialog).toHaveCSS('--garage-anchor-y', '24px');
      await dialog.getByRole('option', { name: new RegExp(name) }).click();
      await expect(dialog).toHaveCount(0);
      await expect(reset).toBeVisible();
    },
  };
}

for (const width of [1440, 390]) {
  test.describe(`${width}px camera views`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: width < 768 });
    test.beforeEach(async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?car=0');
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60000 });
    });

    test('Garage offers front, profile, and corner shots with a reset', async ({ page }) => {
      const { select, reset } = cameraControls(page);
      await select('Front view');
      const front = PNG.sync.read(
        await page.screenshot({ path: test.info().outputPath('front.png') }),
      );
      await select('Profile view');
      const profile = PNG.sync.read(
        await page.screenshot({ path: test.info().outputPath('profile.png') }),
      );
      let changed = 0;
      for (let y = 250; y < 650; y += 2)
        for (let x = 0; x < front.width; x += 2) {
          const i = (y * front.width + x) * 4;
          if (Math.abs(front.data[i] - profile.data[i]) > 30) changed++;
        }
      expect(changed).toBeGreaterThan(500);
      await select('Corner view');
      await reset.click();
      await expect(reset).toBeEnabled();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });

    test('Ferrari Studio details frame the car and leave Contact fixed', async ({ page }) => {
      const { select, reset } = cameraControls(page);
      const intro = page.getByRole('heading', { name: 'Aiden Jang', exact: true });
      await select('Rear three-quarter');
      await expect(intro).toBeHidden();
      await reset.click();
      await expect(intro).toBeVisible();
      await select('Front wheel close-up');
      await expect(intro).toBeHidden();
      if (width < 768) {
        await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name: 'Contact', exact: true })
          .click();
      } else await page.locator('#nav').getByRole('link', { name: 'Contact', exact: true }).click();
      await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
      await page.keyboard.press('?');
      const dialog = page.getByRole('dialog', { name: 'Command menu' });
      await expect(dialog).toBeVisible();
      await dialog.getByRole('combobox', { name: 'Search portfolio controls' }).fill('view');
      await expect(
        dialog.getByRole('option', {
          name: /Profile view|Corner view|Rear three-quarter|Front wheel close-up/,
        }),
      ).toHaveCount(0);
      await page.keyboard.press('Escape');
      await page.mouse.move(width / 2, 500);
      await page.mouse.down();
      await page.mouse.move(width / 2 + 50, 550);
      await page.mouse.up();
      await expect(page.locator('body')).not.toHaveClass(/orbiting/);
    });
  });
}
