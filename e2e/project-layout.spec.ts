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
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page).toHaveURL(/#sec-more-work$/);
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeInViewport();
    const listing = page.locator('#sec-more-work');
    await expect(listing.locator('#project-iodine')).toHaveCount(1);
    await expect(listing.getByRole('heading', { name: 'Shared sign-in', exact: true })).toHaveCount(
      1,
    );
    await expect(listing.locator('#batching-study, #f40-study')).toHaveCount(0);
    await page.goto('/work/');
    await expect(page.getByRole('link', { name: 'Shared sign-in — Project notes' })).toBeVisible();
    await expect(page.locator('.index-project')).toHaveCount(11);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
  });
}
