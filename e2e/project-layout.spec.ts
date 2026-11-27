import { test, expect } from '@playwright/test';
for (const width of [1440, 1024, 768, 390, 320]) {
  test(`project scenes and Work fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 667 : 900 });
    await page.route('**/*.glb', (route) => route.abort());
    if (width === 320)
      await page.route('**/projects/scenes/wherever-pizza.jpg', (route) =>
        route.fulfill({ status: 404 }),
      );
    await page.goto('/#project-wherever');
    const dinner = page.locator('#project-wherever');
    if (width === 320) await expect(dinner.getByText('Pizza for two')).toBeVisible();
    else await expect(dinner.getByAltText('Pepperoni pizza on a wooden peel')).toBeInViewport();
    await expect(dinner.getByRole('link', { name: 'Open app: wherever' })).toHaveAttribute(
      'target',
      '_blank',
    );
    const projectFrames = await page
      .locator('#project-bloomnote, #project-iguess, #project-mrrp, #project-wherever')
      .evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().toJSON()));
    for (const frame of projectFrames) {
      expect(frame.left).toBeCloseTo(0);
      expect(frame.width).toBeCloseTo(width, 0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
    await page.getByRole('link', { name: 'Work index' }).click();
    await expect(
      page.getByRole('link', { name: 'platform One account for the apps' }),
    ).toBeVisible();
    await expect(page.locator('.index-entry')).toHaveCount(11);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
  });
}
