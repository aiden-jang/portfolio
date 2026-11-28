import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`closing a supporting story restores its reading position at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type === 'webgl' || type === 'webgl2') return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#sec-work');
    await page.evaluate(() => document.fonts.ready);
    const iodine = page.getByRole('link', { name: 'My open-source contributions', exact: true });
    await iodine.scrollIntoViewIfNeeded();
    await iodine.focus();
    const position = await page.evaluate(() => scrollY);
    await iodine.press('Enter');
    await expect(page.getByRole('heading', { name: 'An edit you can take back.' })).toBeVisible();
    await page.goBack();
    await expect
      .poll(() => page.evaluate((previous) => Math.abs(scrollY - previous), position))
      .toBeLessThan(2);
    await expect(iodine).toBeInViewport();
    await expect(iodine).toBeFocused();
    await expect(iodine).toHaveAttribute('href', /edit=restored$/);

    for (const [label, id] of [
      ['How I built it: iguess', 'iguess'],
      ['How I built it: worth', 'worth'],
    ]) {
      if (id === 'worth') {
        await page
          .locator('#project-worth')
          .evaluate((entry) => entry.scrollIntoView({ block: 'start', behavior: 'instant' }));
      }
      const trigger = page.getByRole('button', { name: label, exact: true });
      await trigger.scrollIntoViewIfNeeded();
      // The sticky header can settle as the browser moves the pointer target into view.
      const [readingPosition] = await Promise.all([
        trigger.evaluate(
          (button) =>
            new Promise<number>((resolve) =>
              button.addEventListener('pointerdown', () => resolve(window.scrollY), { once: true }),
            ),
        ),
        trigger.click(),
      ]);
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`#work/${id}$`));
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(async () => {
        expect(Math.abs((await page.evaluate(() => scrollY)) - readingPosition)).toBeLessThan(2);
        await expect(trigger).toBeInViewport();
      }).toPass({ timeout: 5000 });
    }
  });
}
