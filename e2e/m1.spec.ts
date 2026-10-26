import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

async function expectRacingColors(page: Page) {
  await expect(async () => {
    const image = PNG.sync.read(await page.screenshot({ timeout: 5000 }));
    let red = 0;
    let blue = 0;
    for (let i = 0; i < image.data.length; i += 4) {
      const [r, g, b] = image.data.subarray(i, i + 3);
      if (r > 70 && r > g * 1.4 && r > b * 1.2) red++;
      if (b > 70 && b > r * 1.4 && b > g * 1.1) blue++;
    }
    expect(red, 'the red Motorsport stripe renders').toBeGreaterThan(100);
    expect(blue, 'the blue Motorsport stripe renders').toBeGreaterThan(100);
  }).toPass({ timeout: 20_000 });
}

test('retired M1 preserves shared links, livery and credits outside the picker across layouts', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/?clean&car=21&paint=original&light=dusk');
  await expectRacingColors(page);
  await page.screenshot({ path: test.info().outputPath('m1-clean.png') });
  await page.goto('/?car=21&paint=%23365d7b&light=dusk');
  const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  for (const [width, height] of [
    [1440, 900],
    [844, 900],
    [390, 844],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height });
    await expect(browse).toHaveAccessibleName('Browse cars. BMW M1 Turbo, Group 5');
    await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
    await expect(page.getByRole('button', { name: /^Paint:/ })).toHaveCount(0);
    await expectRacingColors(page);
    await page.screenshot({ path: test.info().outputPath(`m1-${width}.png`) });
  }
  for (const [width, height] of [
    [1440, 900],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page
      .getByRole('button', { name: 'Lighting: Dusk. Switch to Night', exact: true })
      .filter({ visible: true })
      .click();
    await expect(page.locator('body')).toHaveAttribute('data-theme', 'night');
    await expectRacingColors(page);
    await page.screenshot({ path: test.info().outputPath(`m1-night-${width}.png`) });
    await page
      .getByRole('button', { name: 'Lighting: Night. Switch to Dusk', exact: true })
      .filter({ visible: true })
      .click();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await browse.click();
  const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
  await expect(
    picker.getByRole('button', { name: 'Show BMW M1 Turbo, Group 5', exact: true }),
  ).toHaveCount(0);
  await expect(picker.locator('.car-option').first()).toBeFocused();
  await expect(picker.locator('.car-option[aria-pressed="true"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(browse).toBeFocused();
  await page.reload();
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await expect(browse).toHaveAccessibleName('Browse cars. BMW M1 Turbo, Group 5');
  expect(new URL(page.url()).searchParams.get('car')).toBe('21');
  await page
    .getByRole('button', { name: 'Next car', exact: true })
    .filter({ visible: true })
    .click();
  await expect(browse).toHaveAccessibleName('Browse cars. Ferrari F40, F120');
  await expect.poll(() => new URL(page.url()).searchParams.get('car')).toBe('0');
  await page.locator('.portfolio-menu summary').click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('link', { name: 'Contact', exact: true })
    .click();
  await page.getByRole('button', { name: /3D model credits/ }).click();
  const credit = page
    .getByRole('dialog', { name: '3D model credits' })
    .getByRole('listitem')
    .filter({
      has: page.getByRole('link', { name: 'BMW M1 Turbo | www.vecarz.com', exact: true }),
    });
  await expect(credit).toContainText('by vecarz');
  await expect(credit.getByRole('link', { name: 'JUSTGAME', exact: true })).toHaveAttribute(
    'href',
    /275b2afd66604918affef8529074fdde/,
  );
  await expect(credit.getByRole('link', { name: 'CC BY 4.0', exact: true })).toHaveCount(2);
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});
