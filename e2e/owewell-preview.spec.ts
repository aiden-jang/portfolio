import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`the direct dinner link lands on the bill split at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl')) return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#project-owewell');
    const dinner = page.locator('#project-wherever');
    const total = dinner.locator('.slip-total');
    const shares = dinner.locator('.slip-shares');
    const stamp = dinner.getByRole('button', { name: 'How I built it: worth' });
    await expect(dinner).toHaveAttribute('data-phase', 'owewell');
    await expect(shares).toBeInViewport();
    await expect(total).toHaveText('Dinner for two$48.00');
    await expect(shares.getByText('$24.00', { exact: true })).toHaveCount(2);
    for (const app of ['wherever', 'owewell', 'worth']) {
      await expect(dinner.getByRole('link', { name: 'Open app: ' + app })).toHaveAttribute(
        'href',
        'https://' + app + '.aidenjang.com',
      );
    }
    await page
      .locator('#project-worth')
      .evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(dinner).toHaveAttribute('data-phase', 'worth');
    await expect(stamp).toBeInViewport();
    await expect(stamp).toHaveCSS('opacity', '1');
    await dinner.evaluate((el) => el.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(dinner).toHaveAttribute('data-phase', 'wherever');
    await expect(total).toBeHidden();
    await expect(stamp).toBeHidden();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(stamp).toBeInViewport();
    await expect(stamp).toHaveCSS('opacity', '1');
    await expect(shares).toBeInViewport();
  });
}
