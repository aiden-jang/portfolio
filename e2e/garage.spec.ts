import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  test(`curated garage preserves old links and follows visible order at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.goto('/?car=14&paint=original');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
    await expect(browse).toHaveAccessibleName('Browse cars. Ferrari 296 GT3, GT3');
    await browse.click();
    const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
    const options = picker.locator('.car-option');
    await expect(options).toHaveCount(14);
    await expect(options.first()).toBeFocused();
    await expect(
      picker.getByRole('button', { name: 'Show Porsche 917K, Le Mans', exact: true }),
    ).toHaveCount(0);
    await expect(
      picker.getByRole('button', { name: 'Show Porsche 911 Turbo, 930', exact: true }),
    ).toHaveCount(0);
    await expect(
      picker.getByRole('button', { name: 'Show Ferrari 296 GT3, GT3', exact: true }),
    ).toHaveCount(0);
    await expect(
      picker.getByRole('button', { name: 'Show Ferrari F1-75, 2022 F1', exact: true }),
    ).toBeVisible();
    await expect(
      picker.getByRole('button', { name: 'Show Toyota GR Supra, A90 Modified', exact: true }),
    ).toHaveCount(0);
    await expect(
      picker.getByRole('button', { name: 'Show Nissan GT-R Aimgain, R35 Type 2', exact: true }),
    ).toBeVisible();
    await page.keyboard.press('End');
    await expect(
      picker.getByRole('button', { name: 'Show Red Bull RB16B, 2021 F1', exact: true }),
    ).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await expect(options.first()).toBeFocused();
    await picker.getByRole('button', { name: 'Show Mazda MX-5 Miata, NA', exact: true }).click();
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(browse).toHaveAccessibleName('Browse cars. Mazda MX-5 Miata, NA');
    await expect.poll(() => new URL(page.url()).searchParams.get('car')).toBe('10');
    const headlights = page
      .getByRole('button', { name: 'Pop-up headlights' })
      .filter({ visible: true });
    await expect(headlights).toBeEnabled();
    await expect(headlights).toHaveAttribute('aria-pressed', 'true');
    await headlights.click();
    await expect(headlights).toHaveAttribute('aria-pressed', 'false');
    await headlights.press('Space');
    await expect(headlights).toHaveAttribute('aria-pressed', 'true');
    expect(
      await headlights.evaluate((button) => button.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    await page.locator('h1').click();
    await page.keyboard.press('3');
    await expect(browse).toHaveAccessibleName('Browse cars. Datsun 280Z, S30');
    await expect(page.getByRole('button', { name: 'Pop-up headlights' })).toHaveCount(0);
    await expect.poll(() => new URL(page.url()).searchParams.get('car')).toBe('5');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await page.reload();
    await expect(browse).toHaveAccessibleName('Browse cars. Datsun 280Z, S30');
    await expect(page.getByRole('button', { name: 'Pop-up headlights' })).toHaveCount(0);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  });

  test(`R35 selection survives a reload at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.goto('/');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
    await browse.click();
    await page
      .getByRole('dialog', { name: 'Pick your ride.' })
      .getByRole('button', { name: 'Show Nissan GT-R Aimgain, R35 Type 2', exact: true })
      .click();
    await expect(browse).toHaveAccessibleName('Browse cars. Nissan GT-R Aimgain, R35 Type 2');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect.poll(() => new URL(page.url()).searchParams.get('car')).toBe('17');
    await page.reload();
    await expect(browse).toHaveAccessibleName('Browse cars. Nissan GT-R Aimgain, R35 Type 2');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  });
}
