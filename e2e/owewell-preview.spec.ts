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
    await expect(dinner.getByText('Alex and Maya matched on pizza')).toBeVisible();
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
    await expect(dinner.getByRole('link', { name: 'Open app: wherever' })).toBeVisible();
    await expect(dinner.getByRole('link', { name: 'Open app: owewell' })).toBeVisible();

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

    await page.goto('/?paint=original', { waitUntil: 'domcontentloaded' });
    const pin = dinner.locator('[data-study-pin]');
    await pin.evaluate((body) => {
      const sceneTop = body.parentElement!.getBoundingClientRect().top + scrollY;
      scrollTo({
        top: sceneTop - innerHeight + body.clientHeight * 0.38,
        behavior: 'instant',
      });
    });
    await expect(pin).toBeInViewport({ ratio: 0.3 });
    await expect(pin).not.toBeInViewport({ ratio: 0.64 });
    const progress = () => dinner.evaluate((el) => Number(el.dataset.sceneProgress));
    await expect.poll(progress, { timeout: 2000 }).toBeGreaterThan(0.1);
    await pin.evaluate((body) => {
      scrollBy({ top: -innerHeight - body.getBoundingClientRect().top, behavior: 'instant' });
    });
    await expect(pin).not.toBeInViewport();
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const paused = await progress();
    await page.waitForTimeout(180);
    expect(await progress()).toBe(paused);

    await seek(0.04);
    const parked = await page.evaluate(() => scrollY);
    expect(await progress()).toBeGreaterThanOrEqual(paused);
    await expect.poll(progress).toBeGreaterThan(paused);
    await expect(bill).toHaveCSS('opacity', '1');
    expect(await page.evaluate(() => scrollY)).toBe(parked);
    await seek(0.15);
    await expect(bill).toHaveCSS('opacity', '1');
    await expect(vote).toBeHidden();
    await expect(dinner.getByRole('link', { name: 'Open app: wherever' })).toBeVisible();
    await expect.poll(progress).toBe(1);
    await pin.evaluate((body) => {
      scrollBy({ top: -innerHeight - body.getBoundingClientRect().top, behavior: 'instant' });
    });
    await expect(dinner).toHaveAttribute('data-dinner-state', 'vote');
    await seek(0.04);
    await expect(vote).toBeVisible();

    await page.goto('/#project-owewell');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(bill.getByText('Alex owes you')).toBeInViewport();
    await expect(bill).toHaveCSS('transform', 'none');
    await expect(match).toHaveCSS('opacity', '1');
    await expect(vote).toBeHidden();
  });
}
