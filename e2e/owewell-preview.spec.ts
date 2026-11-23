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
    const bill = dinner.locator('#project-owewell');
    await expect(bill.getByText('Alex owes you')).toBeInViewport();
    await expect(bill.getByText('$24.00', { exact: true })).toHaveCount(2);
    await expect
      .poll(() => dinner.evaluate((el) => Number(el.style.getPropertyValue('--tear'))))
      .toBe(1);
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
