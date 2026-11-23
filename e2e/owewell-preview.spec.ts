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
    const pizza = dinner.locator('.dinner-ticket-photo');
    const vote = dinner.locator('.dinner-ticket-state .dinner-ticket-vote');
    const match = dinner.locator('.dinner-ticket-state .dinner-ticket-match');
    await expect(bill.getByText('Alex owes you')).toBeInViewport();
    await expect(bill).toHaveCSS('opacity', '1');
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

    async function seek(progress: number) {
      await dinner.evaluate((stage, amount) => {
        const pin = stage.querySelector<HTMLElement>('[data-study-pin]')!;
        const start =
          scrollY + stage.getBoundingClientRect().top - parseFloat(getComputedStyle(pin).top);
        scrollTo({
          top: start + (stage.clientHeight - pin.clientHeight) * amount,
          behavior: 'instant',
        });
      }, progress);
    }

    await seek(0.04);
    await expect(vote).toHaveCSS('opacity', '1');
    const before = (await pizza.boundingBox())!;
    await seek(0.46);
    await expect(match).toHaveCSS('opacity', '1');
    await expect(dinner.getByText('2 of 2 picked it')).toBeInViewport();
    const after = (await pizza.boundingBox())!;
    expect(after.x).toBeCloseTo(before.x, 0);
    expect(after.y).toBeCloseTo(before.y, 0);
    await seek(0.04);
    await expect(vote).toHaveCSS('opacity', '1');
    await expect(bill).toHaveCSS('opacity', '0');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(bill.getByText('Alex owes you')).toBeInViewport();
    await expect(bill).toHaveCSS('transform', 'none');
    await expect(match).toHaveCSS('opacity', '1');
    await expect(vote).toBeHidden();
  });
}
