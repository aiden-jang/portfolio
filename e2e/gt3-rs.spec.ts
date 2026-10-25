import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`GT3 RS replaces GT3 selection and preserves its livery at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.goto('/?car=12&paint=original');
    const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
    await expect(browse).toHaveAccessibleName('Browse cars. Porsche 911 GT3, 992');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await browse.click();
    const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
    await expect(picker.locator('.car-option')).toHaveCount(12);
    await expect(
      picker.getByRole('button', { name: 'Show Porsche 911 GT3, 992', exact: true }),
    ).toHaveCount(0);
    await picker.getByRole('button', { name: 'Show Porsche 911 GT3 RS, 992', exact: true }).click();
    await expect(browse).toHaveAccessibleName('Browse cars. Porsche 911 GT3 RS, 992');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect.poll(() => new URL(page.url()).searchParams.get('car')).toBe('18');
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
    await expect(page.getByRole('button', { name: /^Paint:/ })).toHaveCount(0);
    await page.goto('/?car=18&paint=%23365d7b&light=night');
    await expect(browse).toHaveAccessibleName('Browse cars. Porsche 911 GT3 RS, 992');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
    await expect(page.getByRole('button', { name: /^Paint:/ })).toHaveCount(0);
    await expect(page.locator('canvas')).toBeVisible();
  });
}
