import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
for (const width of [1440, 390]) {
  test.describe(`${width}px camera views`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: width < 768, hasTouch: width < 768 });
    test('Garage offers camera shots and Contact stays fixed', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/');
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60000 });
      const garage = page
        .getByRole('button', { name: 'All controls', exact: true })
        .filter({ visible: true });
      const reset = page
        .getByRole('button', { name: 'Reset camera view', exact: true })
        .filter({ visible: true });
      const select = async (name: string) => {
        await garage.click();
        await expect(page.getByRole('dialog', { name: 'Command menu' })).toHaveCSS(
          '--garage-anchor-y',
          '24px',
        );
        await page.getByRole('option', { name: new RegExp(name) }).click();
        await expect(page.getByRole('dialog', { name: 'Command menu' })).toHaveCount(0);
        await expect(reset).toBeVisible();
      };
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
      await select('Detail view');
      await page.screenshot({ path: test.info().outputPath('detail.png') });
      await reset.click();
      await expect(reset).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width < 768) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name: 'Contact', exact: true })
          .click();
      } else await page.locator('#nav').getByRole('link', { name: 'Contact', exact: true }).click();
      await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
      await page.keyboard.press('Control+k');
      await page.getByRole('combobox', { name: 'Search portfolio controls' }).fill('view');
      await expect(page.getByRole('option', { name: /Profile view/ })).toHaveCount(0);
      await expect(page.getByRole('option', { name: /Detail view/ })).toHaveCount(0);
      await page.keyboard.press('Escape');
      await page.mouse.move(width / 2, 500);
      await page.mouse.down();
      await page.mouse.move(width / 2 + 50, 550);
      await page.mouse.up();
      await expect(page.locator('body')).not.toHaveClass(/orbiting/);
    });
  });
}
