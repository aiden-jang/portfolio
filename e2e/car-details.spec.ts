import { expect, test } from '@playwright/test';
import { controlLayout, expectCompactControls, expectControlLayout } from './controlLayout';

for (const [index, name, action] of [
  [16, 'Ferrari F1-75', 'DRS rear wing'],
  [15, 'Red Bull RB16B', 'DRS rear wing'],
] as const) {
  test(`${name} detail works on phone and desktop and clears on a car change`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`/?car=${index}&light=night`);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    const button = () =>
      page.getByRole('button', { name: action, exact: true }).filter({ visible: true });
    for (const width of [320, 1440]) {
      if (width === 1440) await page.setViewportSize({ width, height: 900 });
      await expect(button()).toBeEnabled();
      await expectCompactControls(page);
      const lastLayout = await controlLayout(page);
      await page
        .getByRole('button', { name: /^Lighting:/ })
        .filter({ visible: true })
        .click();
      await expectControlLayout(page, lastLayout);
      const bounds = await button().evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          x: rect.x,
          right: rect.right,
          width: rect.width,
          height: rect.height,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(width);
      expect(bounds.overflow).toBe(false);
      if (width === 320) await button().click();
      else await button().press('Space');
      await expect(button()).toHaveAttribute('aria-pressed', width === 320 ? 'true' : 'false');
      await expectControlLayout(page, lastLayout);
    }
    await page.locator('h1').click();
    await page.keyboard.press('1');
    await expect(page.getByRole('button', { name: action, exact: true })).toHaveCount(0);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expectCompactControls(page);
    expect(errors).toEqual([]);
  });
}

test('Supra keeps compact paint controls without a headlight action on phone and desktop', async ({
  page,
}) => {
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/?car=2&light=night');
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole('button', { name: /Flash headlights|Pop-up headlights|DRS rear wing/ }),
    ).toHaveCount(0);
    await expectCompactControls(page);
    const original = await controlLayout(page);
    await page
      .getByRole('button', { name: /^Lighting:/ })
      .filter({ visible: true })
      .click();
    await expectControlLayout(page, original);
    if (width === 320) {
      const paint = page.getByRole('button', { name: /^Paint:.*Change color$/ });
      await expect(paint).toBeEnabled();
      for (let i = 0; i < 7; i++) {
        await paint.click();
        await expectControlLayout(page, original);
      }
    } else {
      await expect(page.getByRole('group', { name: 'Paint', exact: true })).toBeVisible();
    }
  }
});
