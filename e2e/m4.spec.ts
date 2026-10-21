import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`restored M4 loads, repaints and appears in the picker at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    const model = page.waitForResponse('**/models/bmw-g82-m4-adro.glb');
    await page.goto('/?car=9&paint=original');
    expect((await model).ok()).toBe(true);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    const browse = page
      .getByRole('button', { name: 'Browse cars. BMW M4 ADRO, G82', exact: true })
      .filter({ visible: true });
    await expect(browse).toBeVisible();
    await expect(
      page
        .getByRole('button', { name: /Paint: Amethyst/ })
        .filter({ visible: true })
        .first(),
    ).toBeEnabled();
    await page.keyboard.press('c');
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
    await page.reload();
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(
      page
        .getByRole('button', { name: /Paint: Bordeaux/ })
        .filter({ visible: true })
        .first(),
    ).toBeEnabled();
    await browse.click();
    const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
    await expect(
      picker.getByRole('button', { name: 'Show BMW M4 ADRO, G82', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(picker).toContainText('Individual model licenses apply.');
    await page.keyboard.press('Escape');
  });
}
