import { expect, test } from '@playwright/test';

test('Intro keeps the dock focused on browsing, lighting, Photo and Garage', async ({ page }) => {
  await page.route('**/assets/Scene-*.js', () => {});
  await page.goto('/?car=0', { waitUntil: 'domcontentloaded' });
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    const dock = page.locator(width < 768 ? '#mobile-bar' : '#desktop-dock');
    await expect(dock.getByRole('button', { name: /Browse cars/ })).toBeVisible();
    await expect(dock.getByRole('button', { name: /^Lighting:/ })).toBeVisible();
    await expect(dock.getByRole('button', { name: 'Photo mode' })).toBeVisible();
    await expect(dock.getByRole('button', { name: 'Garage controls' })).toBeVisible();
    await expect(dock.getByRole('button', { name: /^Zoom (in|out)$/ })).toHaveCount(0);
    const row = (await dock.locator('.car-controls-row').boundingBox())!;
    expect(row.x).toBeGreaterThanOrEqual(0);
    expect(row.x + row.width).toBeLessThanOrEqual(width + 1);
  }
});
