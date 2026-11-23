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
    const vote = dinner.locator('.dinner-ticket-state .dinner-ticket-vote');
    const match = dinner.locator('.dinner-ticket-state .dinner-ticket-match');
    await expect(bill.getByText('Alex owes you')).toBeInViewport();
    await expect(bill).toHaveCSS('opacity', '1');
    await expect(bill.getByText('$24.00', { exact: true })).toHaveCount(2);
    await expect
      .poll(() => dinner.evaluate((el) => Number(el.style.getPropertyValue('--tear'))))
      .toBe(1);
    await expect(dinner.locator('a[aria-label="Open app: wherever"]')).toHaveAttribute(
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
    await expect(vote).toBeHidden();
    await expect(bill).toHaveCSS('opacity', '1');
    await expect(dinner.getByRole('button', { name: 'Replay dinner' })).toHaveCount(0);

    await page.goto('/?paint=original#project-wherever', { waitUntil: 'domcontentloaded' });
    await seek(0.04);
    await expect(dinner).toHaveAttribute('data-dinner-state', 'vote');
    const parked = await page.evaluate(() => scrollY);
    await expect(dinner).toHaveAttribute('data-dinner-state', 'match');
    await expect(bill).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => scrollY)).toBe(parked);
    await seek(0.15);
    await expect(bill).toHaveCSS('opacity', '1');
    await expect(vote).toBeHidden();

    await page.goto('/#project-owewell');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(bill.getByText('Alex owes you')).toBeInViewport();
    await expect(bill).toHaveCSS('transform', 'none');
    await expect(match).toHaveCSS('opacity', '1');
    await expect(vote).toBeHidden();
  });
}
