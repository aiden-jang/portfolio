import { expect, test } from '@playwright/test';
import { controlLayout, expectCompactControls, expectControlLayout } from './controlLayout';
import { CARS, GARAGE_INDICES } from '../src/config';

for (const width of [1440, 390]) {
  test(`curated garage preserves old links and follows visible order at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.goto('/?car=6&paint=original');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
    await expect(browse).toHaveAccessibleName('Browse cars. Audi R8, Widebody');
    await browse.click();
    const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
    const options = picker.locator('.car-option');
    await expect(options).toHaveCount(13);
    await expect
      .poll(() =>
        options.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
      )
      .toEqual(GARAGE_INDICES.map((index) => `Show ${CARS[index].name}, ${CARS[index].code}`));
    await expect(options.first()).toBeFocused();
    await expect(
      picker.getByRole('button', { name: 'Show Audi R8, Widebody', exact: true }),
    ).toHaveCount(0);
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
    for (const retired of [
      'Show Lamborghini Countach, 5000 QV',
      'Show Toyota Supra, A80',
      'Show Lamborghini Aventador, SV',
    ]) {
      await expect(picker.getByRole('button', { name: retired, exact: true })).toHaveCount(0);
    }
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
    await browse.click();
    const selected = picker.getByRole('button', { name: 'Show Mazda MX-5 Miata, NA', exact: true });
    await expect(selected).toBeFocused();
    await selected.hover();
    await page.keyboard.press('ArrowRight');
    await expect(
      picker.getByRole('button', { name: 'Show Datsun 280Z, S30', exact: true }),
    ).toBeFocused();
    await expect(selected).toHaveAttribute('aria-pressed', 'true');
    await expect(selected).toContainText('Selected');
    const framed = await options.evaluateAll((buttons) =>
      buttons
        .filter((button) => {
          const style = getComputedStyle(button);
          return button.matches(':focus-visible') || style.borderTopColor === style.color;
        })
        .map((button) => button.getAttribute('aria-label')),
    );
    expect(framed, 'only the keyboard target has an emphasized car frame').toEqual([
      'Show Datsun 280Z, S30',
    ]);
    await page.keyboard.press('Escape');
    await expect(browse).toBeFocused();
    const headlights = page
      .getByRole('button', { name: 'Pop-up headlights' })
      .filter({ visible: true });
    await expect(headlights).toBeEnabled();
    await expect(headlights).toHaveAttribute('aria-pressed', 'true');
    const originalLayout = await controlLayout(page);
    await expectCompactControls(page);
    await headlights.click();
    await expect(headlights).toHaveAttribute('aria-pressed', 'false');
    await expectControlLayout(page, originalLayout);
    await headlights.press('Space');
    await expect(headlights).toHaveAttribute('aria-pressed', 'true');
    await expectControlLayout(page, originalLayout);
    expect(
      await headlights.evaluate((button) => button.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(44);
    await page.locator('h1').click();
    await page.keyboard.press('4');
    await expect(browse).toHaveAccessibleName('Browse cars. Datsun 280Z, S30');
    await expect(page.getByRole('button', { name: 'Pop-up headlights' })).toHaveCount(0);
    await expect.poll(() => new URL(page.url()).searchParams.get('car')).toBe('5');
    await expectCompactControls(page);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await page.reload();
    await expect(browse).toHaveAccessibleName('Browse cars. Datsun 280Z, S30');
    await expect(page.getByRole('button', { name: 'Pop-up headlights' })).toHaveCount(0);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  });

  test(`R35 selection survives a reload at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const defaultPaint = page
      .getByRole('button', {
        name:
          width === 390
            ? 'Paint: Titanium Silver. Change color'
            : 'Paint: Titanium Silver (default)',
        exact: true,
      })
      .filter({ visible: true });
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
    await expect(defaultPaint).toBeVisible();
    if (width === 1440) await expect(defaultPaint).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(browse).toHaveAccessibleName('Browse cars. Nissan GT-R Aimgain, R35 Type 2');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await expect(defaultPaint).toBeVisible();
    if (width === 1440) await expect(defaultPaint).toHaveAttribute('aria-pressed', 'true');
  });
}
