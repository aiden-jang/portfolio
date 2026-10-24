import { expect, test } from '@playwright/test';

test('Countach shared paint and selection work across phone and desktop layouts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
  await page.goto('/?car=19&paint=%23702c43&light=dusk');
  const browse = page.getByRole('button', { name: /Browse cars\./ }).filter({ visible: true });
  await expect(browse).toHaveAccessibleName('Browse cars. Lamborghini Countach, 5000 QV');
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await expect(
    page.getByRole('button', { name: 'Paint: Bordeaux. Change color', exact: true }),
  ).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Pop-up headlights' })).toHaveCount(0);
  await browse.click();
  const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
  const selected = picker.getByRole('button', {
    name: 'Show Lamborghini Countach, 5000 QV',
    exact: true,
  });
  await expect(selected).toBeFocused();
  await expect(selected).toHaveAttribute('aria-pressed', 'true');
  await selected.click();
  await expect(browse).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  const bordeaux = page.getByRole('button', { name: 'Paint: Bordeaux', exact: true });
  await expect(bordeaux).toHaveAttribute('aria-pressed', 'true');
  const giallo = page.getByRole('button', { name: 'Paint: Giallo (default)', exact: true });
  await giallo.click();
  await expect(giallo).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');
  await bordeaux.click();
  await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
  expect(new URL(page.url()).searchParams.get('car')).toBe('19');
  await expect(page.locator('canvas')).toBeVisible();
});
