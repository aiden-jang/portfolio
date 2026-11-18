import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  const phone = viewport.width < 768;
  const device = phone ? 'mobile' : 'desktop';
  test(`the ${device} Ferrari poster hands off to the live garage`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: phone ? 'reduce' : 'no-preference' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    let resume!: () => void;
    const gate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    await page.route('**/models/ferrari-f120-f40.glb', async (route) => {
      await gate;
      await route.continue();
    });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const title = page.getByRole('heading', { name: 'Aiden Jang', exact: true });
      await expect(title).toBeVisible();
      const art = page.locator('.opening-poster img');
      await expect(art).toBeVisible({ timeout: 8_000 });
      await expect
        .poll(() => art.evaluate((photo) => (photo as HTMLImageElement).currentSrc))
        .toContain(`f40-${device}-${phone ? 'settled' : 'opening'}.webp`);
      const firstPosition = await title.boundingBox();
      await expect(page.locator('.car-choice-status').first()).toContainText(/loading/i);
      resume();
      await expect(art).toHaveCount(0, { timeout: 60_000 });
      await expect(page.locator('.car-choice-status').first()).toHaveText('');
      expect(await title.boundingBox()).toEqual(firstPosition);
    } finally {
      resume();
    }
  });
}

test('Behind the render switches finishes and returns focus to Garage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
  await page.goto('/');
  const garage = page.getByRole('button', { name: 'All controls', exact: true }).filter({
    visible: true,
  });
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await garage.click();
  await page.getByRole('combobox').fill('Behind the render');
  await page.getByRole('option', { name: /Behind the render/ }).click();
  const study = page.getByRole('dialog', { name: 'Behind the render' });
  await expect(study.getByRole('button', { name: 'Studio' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await study.getByRole('button', { name: 'Clay' }).click();
  await expect(study.getByRole('button', { name: 'Clay' })).toHaveAttribute('aria-pressed', 'true');
  await study.getByText('How I built it', { exact: true }).click();
  await expect(study.getByText(/The floor renders a second view/)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(study).toHaveCount(0);
  await expect(garage).toBeFocused();
});
