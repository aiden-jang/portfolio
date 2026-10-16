import { test, expect } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`shared screenshots follow Back and Forward at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
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
    await page.goto('/?preview=bloomnote:0#project-bloomnote');
    const views = page.getByRole('group', { name: 'bloomnote product views' });
    const first = views.getByRole('button').nth(0);
    const second = views.getByRole('button').nth(1);
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await second.click();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() => {
      const url = new URL(location.href);
      url.searchParams.set('preview', 'bloomnote:1');
      history.pushState(null, '', url);
    });
    await page.goBack();
    await expect(first).toHaveAttribute('aria-pressed', 'true');
    await page.goForward();
    await expect(second).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Inspect screenshot: bloomnote', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'bloomnote screenshot' });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`preview-history-${width}.png`),
      animations: 'disabled',
    });
  });
}
