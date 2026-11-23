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
    const bill = dinner.getByRole('img', { name: /splits the .48 dinner bill/ });
    await expect(bill).toBeInViewport();
    await expect(bill.locator('../..')).toHaveCSS('opacity', '1');
    await expect
      .poll(() => bill.evaluate((image: HTMLImageElement) => image.naturalWidth))
      .toBeGreaterThan(0);
    await expect(dinner.getByRole('link', { name: 'Open app: wherever' })).toHaveAttribute(
      'href',
      'https://wherever.aidenjang.com',
    );
    await expect(dinner.getByRole('link', { name: 'Open app: owewell' })).toHaveAttribute(
      'href',
      'https://owewell.aidenjang.com',
    );
  });
}
