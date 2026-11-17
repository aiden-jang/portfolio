import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [320, 568],
]) {
  test(`featured work actions and recorded evidence fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
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
    const inspect = page.getByRole('button', { name: 'Inspect an earthquake', exact: true });
    const story = page.getByRole('button', {
      name: 'How I built it: everythingisfine',
      exact: true,
    });
    await expect(inspect).toHaveCount(1, { timeout: 5000 });
    await expect(inspect).toBeInViewport({ ratio: 1 });
    await expect(story).toBeInViewport({ ratio: 1 });
    await inspect.press('Enter');
    await expect(
      page.getByRole('heading', { name: 'One earthquake. Two readings.' }),
    ).toBeFocused();
    const evidence = page.getByRole('region', { name: 'Off the east coast of Kamchatka' });
    await expect(evidence).toContainText('54.7 km deep');
    await expect(evidence).toContainText('71.0 km deep');
    const read = page.getByRole('button', { name: 'See how I matched the reports' });
    await read.click();
    const reader = page.getByRole('dialog');
    await expect(reader.getByText('One event on the globe', { exact: true })).toBeVisible();
    await reader.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(read).toBeFocused();
    await page.getByRole('button', { name: 'Back to the globe preview' }).click();
    await expect(inspect).toBeFocused();
    await page.getByRole('button', { name: 'Read my contribution to iodine' }).click();
    await expect(reader.getByText('.trim()', { exact: true })).toBeVisible();
    const undo = reader.getByRole('button', { name: 'Undo edit', exact: true });
    await undo.press('Enter');
    await expect(reader.getByText('Revert feedback queued', { exact: true })).toBeVisible();
    await expect(reader.getByRole('button', { name: 'Replay edit', exact: true })).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
