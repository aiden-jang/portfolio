import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
  { width: 375, height: 667 },
]) {
  const phone = viewport.width < 768;
  const short = viewport.height === 667;
  const device = short ? 'short mobile' : phone ? 'mobile' : 'desktop';
  const poster = short ? 'phone-short' : phone ? 'phone' : 'desktop';
  test(`the ${device} After Hours Corvette poster hands off to the live garage`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: phone ? 'reduce' : 'no-preference' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    let resume!: () => void;
    const gate = new Promise<void>((resolve) => {
      resume = resolve;
    });
    await page.route('**/models/corvette-opening.glb', async (route) => {
      await gate;
      await route.continue();
    });
    let resumeFloor!: () => void;
    const floorGate = new Promise<void>((resolve) => {
      resumeFloor = resolve;
    });
    await page.route('**/showroom/studio/floor.jpg', async (route) => {
      await floorGate;
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
        .toContain(`/corvette/after-hours-${poster}.webp`);
      const firstPosition = await title.boundingBox();
      await expect(page.locator('.car-choice-status').first()).toContainText(/loading/i);
      resume();
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await expect(art).toBeVisible();
      resumeFloor();
      await expect(art).toHaveCount(0, { timeout: 60_000 });
      await expect(page.locator('.car-choice-status').first()).toHaveText('');
      expect(await title.boundingBox()).toEqual(firstPosition);
      const opening = page.getByRole('button', { name: 'Pause opening camera' });
      if (phone) {
        await expect(opening).toHaveCount(0);
      } else {
        await expect(opening).toBeVisible();
        await opening.click();
        await page.locator('#sec-work').evaluate((section) => section.scrollIntoView());
        await expect(opening).toHaveCount(0);
        await page.getByRole('button', { name: 'Aiden Jang, back to the top' }).click();
        await expect(opening).toBeVisible();
      }
    } finally {
      resume();
      resumeFloor();
    }
  });
}

test('Behind the render switches finishes and returns focus to Garage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
  await page.goto('/?car=0');
  const garage = page.getByRole('button', { name: 'Garage controls', exact: true }).filter({
    visible: true,
  });
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await garage.press('Control+k');
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

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test(`About keeps the finish study and credits available at ${width}×${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
    await page.goto('/#sec-about', { waitUntil: 'domcontentloaded' });
    const study = page.getByRole('figure', {
      name: 'I build tools that make complex work easier.',
    });
    const slider = study.getByRole('slider', { name: 'Ferrari finish' });
    await slider.scrollIntoViewIfNeeded();
    await slider.focus();
    await slider.press('End');
    await expect(slider).toHaveAttribute('aria-valuetext', 'Paint');
    await expect(study.getByRole('link', { name: 'vecarz' })).toHaveCount(0);
    await page.goto('/#sec-contact');
    await page.getByRole('button', { name: '3D model credits' }).click();
    const credits = page.getByRole('dialog', { name: '3D model credits' });
    const closing = credits.getByRole('region', { name: 'Car in the closing frame' });
    await expect(closing).toContainText('by vecarz');
    await expect(closing.getByRole('link', { name: 'CC BY 4.0' })).toBeVisible();
    await expect(credits.locator('.model-credit-detail').first()).toContainText('Ferrari F40');
    await expect(page.getByRole('button', { name: 'Open this shot in Studio' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'How I built the showroom' })).toHaveCount(0);
  });
}
