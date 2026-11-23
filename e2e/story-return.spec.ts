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
    const iodine = page.getByRole('link', { name: 'Read the iodine case study', exact: true });
    await iodine.scrollIntoViewIfNeeded();
    const position = await page.evaluate(() => scrollY);
    await iodine.click();
    await expect(page.getByRole('heading', { name: 'An edit you can take back.' })).toBeVisible();
    await page.goBack();
    await expect
      .poll(() => page.evaluate((previous) => Math.abs(scrollY - previous), position))
      .toBeLessThan(2);
    await expect(iodine).toBeInViewport();

    for (const [label, id] of [
      ['How I built it: iguess', 'iguess'],
      ['How I built it: worth', 'worth'],
    ]) {
      const trigger = page.getByRole('button', { name: label, exact: true });
      await trigger.scrollIntoViewIfNeeded();
      const readingPosition = await page.evaluate(() => scrollY);
      await trigger.click();
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
