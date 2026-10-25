import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`Corvette keeps its racing livery and shared identity at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/?car=20&paint=%23365d7b&light=dusk');
    const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
    await expect(browse).toHaveAccessibleName('Browse cars. Chevrolet Corvette, C8.R TF Sport');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
    await expect(page.getByRole('button', { name: /^Paint:/ })).toHaveCount(0);
    await expect(page.locator('canvas')).toBeVisible();
    await browse.click();
    const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
    const corvette = picker.getByRole('button', {
      name: 'Show Chevrolet Corvette, C8.R TF Sport',
      exact: true,
    });
    await expect(corvette).toHaveAttribute('aria-pressed', 'true');
    await expect(corvette.locator('img')).toBeVisible();
    await expect
      .poll(() =>
        corvette.locator('img').evaluate((image) => (image as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await page.reload();
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(browse).toHaveAccessibleName('Browse cars. Chevrolet Corvette, C8.R TF Sport');
    expect(new URL(page.url()).searchParams.get('car')).toBe('20');
    await expect(page.getByRole('button', { name: /^Paint:/ })).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
