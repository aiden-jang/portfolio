import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test.describe(`owewell at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 }, hasTouch: width === 390 });

    test('changing the payer reverses the settlement and keeps the screenshot available', async ({
      page,
    }) => {
      await page.goto('/#project-owewell');
      const owewell = page.locator('#project-owewell');
      const result = owewell.getByRole('status');
      const you = owewell.getByRole('radio', { name: 'You', exact: true });
      const alex = owewell.getByRole('radio', { name: 'Alex', exact: true });
      await expect(you).toBeChecked();
      await expect(result).toHaveText('Alex pays you $24.00');

      if (width < 768) await alex.tap();
      else await you.press('ArrowRight');
      await expect(alex).toBeChecked();
      await expect(result).toHaveText('You pay Alex $24.00');
      await expect(owewell.getByRole('link', { name: 'Open app: owewell' })).toBeVisible();

      const screenshot = owewell.getByRole('button', { name: 'Inspect screenshot: owewell' });
      await screenshot.click();
      const viewer = page.getByRole('dialog', { name: 'owewell screenshot' });
      await expect(viewer.getByRole('img')).toHaveAttribute('src', '/projects/owewell-alex.webp');
      await expect(viewer).toContainText('Maya owes Alex $24');
      await viewer.getByRole('button', { name: 'Close screenshot' }).click();
      await expect(screenshot).toBeFocused();
      await expect(alex).toBeChecked();

      if (width < 768) await you.tap();
      else await alex.press('ArrowLeft');
      await expect(you).toBeChecked();
      await expect(result).toHaveText('Alex pays you $24.00');
      await screenshot.click();
      await expect(viewer.getByRole('img')).toHaveAttribute('src', '/projects/owewell-you.webp');
      await expect(viewer).toContainText('Alex owes Maya $24');
    });
  });
}
