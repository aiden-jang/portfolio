import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`fixed racing livery ignores linked paint and hides controls at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.goto('/?car=8&paint=%23365d7b&light=night');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(
      page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true }),
    ).toHaveAccessibleName('Browse cars. Porsche 917K, Le Mans');
    await expect(page.locator('button[aria-label^="Paint:"]')).toHaveCount(0);
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
    await page.keyboard.press('c');
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
    await page.keyboard.press('Control+k');
    const commands = page.getByRole('dialog', { name: 'Command menu' });
    await expect(commands).toBeVisible();
    await expect(commands.getByRole('button', { name: /Change paint color/ })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await page
      .getByRole('button', { name: 'Browse cars. Porsche 917K, Le Mans', exact: true })
      .filter({ visible: true })
      .click();
    await page.getByRole('button', { name: 'Show Ferrari F40, F120', exact: true }).click();
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(
      page
        .getByRole('button', { name: /Paint: Ferrari Red/ })
        .filter({ visible: true })
        .first(),
    ).toBeVisible();
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
  });
}
