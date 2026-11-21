import { expect, test, type Page } from '@playwright/test';
import { openStudioControls } from './studioControls';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Garage Studio at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: phone, hasTouch: phone });

    async function openStudio(page: Page) {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?car=0&paint=%23702c43&light=night');
      const garage = page
        .getByRole('button', { name: 'Garage controls', exact: true })
        .filter({ visible: true });
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await garage.click();
      await page.getByRole('option', { name: /^Explore Studio/ }).click();
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) =>
        studio.getByRole('button', { name, exact: true }).filter({ visible: true });
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await ready();
      await openStudioControls(studio);
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeHidden();
      return { studio, button, garage, ready };
    }

    test('switches walkaround cameras, render passes and blackout lighting', async ({ page }) => {
      const { studio, button } = await openStudio(page);
      await expect(button('Wheel height')).toHaveAttribute('aria-pressed', 'true');
      await button('Standard height').click();
      await expect(button('Standard height')).toHaveAttribute('aria-pressed', 'true');
      const clip = {
        x: Math.round(width * 0.69),
        y: 505,
        width: Math.round(width * 0.13),
        height: 44,
      };
      await expect
        .poll(async () => {
          const image = PNG.sync.read(await page.screenshot({ clip }));
          let light = 0;
          for (let i = 0; i < image.data.length; i += 4) light += image.data[i];
          return light / (image.data.length / 4);
        })
        .toBeGreaterThan(12);
      await button('Rear').click();
      await button('Render study').click();
      for (const pass of ['Clay', 'Shadows', 'Reflection']) {
        await button(pass).click();
        await expect(button(pass)).toHaveAttribute('aria-pressed', 'true');
      }
      await button('Done').click();
      await button('Blackout').first().click();
      const looks = studio.getByRole('combobox', { name: 'Studio lighting' });
      await looks.selectOption('blackout');
      await expect(looks).toHaveValue('blackout');
    });

    test('restores a shared mechanical shot and returns to the portfolio', async ({ page }) => {
      const { studio, button, ready } = await openStudio(page);
      await button('Details').click();
      await ready();
      await button('Open DRS').click();
      await button('Share shot').click();
      const link = new URL(
        await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue(),
      );
      expect(link.searchParams.get('part')).toBe('up');
      expect(link.searchParams.get('garage')).toBe('studio');
      await page.goto(link.toString());
      await ready();
      await openStudioControls(studio);
      await expect(button('Close DRS')).toHaveAttribute('aria-pressed', 'true');
      await button('Back to portfolio').click();
      await expect(studio).toBeHidden();
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
    });

    test('saves a framed Lineup photo and restores the showroom', async ({ page }) => {
      test.setTimeout(240_000);
      const { studio, button, garage, ready } = await openStudio(page);
      await button('Lineup').click();
      await ready();
      await button('Overhead').click();
      await expect(button('Overhead')).toHaveAttribute('aria-pressed', 'true');
      await button('Axle guides').click();
      await expect(button('Axle guides')).toHaveAttribute('aria-pressed', 'true');
      await button('Photo').click();
      if (!phone) await button('Landscape 16:9').click();
      await button('Capture').click();
      const photograph = studio.getByRole('img', { name: 'Captured studio photograph' });
      const failed = studio.getByText('Photo could not be captured. Try again.', { exact: true });
      await expect(photograph.or(failed)).toBeVisible({ timeout: 60_000 });
      await expect(failed).toBeHidden();
      await expect(photograph).toBeVisible();
      const captured = await photograph.getAttribute('src');
      const crop = studio.getByRole('group', { name: 'Photo crop. Use arrows to reframe.' });
      await expect(crop).toBeFocused();
      await expect(button('Lineup')).toBeHidden();
      await crop.press('ArrowDown');
      await expect(photograph).toHaveCSS('object-position', '50% 45%');
      await button(phone ? 'Wide 16:9' : 'Portrait 4:5').click();
      await expect(photograph).toHaveAttribute('src', captured!);
      await button('Center').click();
      await expect(photograph).toHaveCSS('object-position', '50% 50%');
      const download = page.waitForEvent('download');
      await button('Save photo').click();
      const saved = await download;
      const { width: photoWidth, height: photoHeight } = PNG.sync.read(
        await readFile((await saved.path())!),
      );
      expect(photoWidth / photoHeight).toBeCloseTo(phone ? 16 / 9 : 4 / 5, 2);

      await button('Done').click();
      await button('Back to Garage').click();
      await expect(studio).toHaveCount(0);
      await expect(garage).toBeFocused();
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
      expect(new URL(page.url()).searchParams.get('light')).toBe('night');
    });
  });
}

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Studio materials and cameras at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: phone, hasTouch: phone });

    test('compares finishes, zooms into the F40 deck, and shares the camera', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) =>
        studio.getByRole('button', { name, exact: true }).filter({ visible: true });
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await ready();
      await openStudioControls(studio);

      const clip = { x: 0, y: 248, width, height: 342 };
      const capture = async () => {
        await page.evaluate(
          () =>
            new Promise<void>((resolve) => {
              requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
            }),
        );
        return PNG.sync.read(await page.screenshot({ clip, timeout: 10_000 }));
      };
      const visuallyDiffers = async (before: PNG) => {
        const after = await capture();
        let changed = 0;
        for (let i = 0; i < before.data.length; i += 4)
          if (Math.abs(before.data[i] - after.data[i]) > 12) changed++;
        return changed;
      };
      await button('Render study').click();
      const refined = await capture();
      await button('Current').click();
      await expect.poll(() => visuallyDiffers(refined)).toBeGreaterThan(200);
      const current = await capture();
      await button('Refined').click();
      await expect.poll(() => visuallyDiffers(current)).toBeGreaterThan(200);
      await button('Done').click();

      await button('Long lens').click();
      await expect(button('Long lens')).toHaveAttribute('aria-pressed', 'true');
      await button('Rear deck').click();
      await expect(button('Rear deck')).toHaveAttribute('aria-pressed', 'true');
      const deck = await capture();
      await button('Zoom in').click();
      await expect.poll(() => visuallyDiffers(deck)).toBeGreaterThan(500);

      await button('Render study').click();
      await button('Current').click();
      await button('Done').click();
      await button('Share shot').click();
      const field = studio.getByRole('textbox', { name: 'Exact shot link' });
      const url = new URL(await field.inputValue());
      expect(url.searchParams.get('camera')).toBe('deck');
      expect(url.searchParams.get('finish')).toBe('current');
      expect(Number(url.searchParams.get('zoom'))).toBeLessThan(1);
      await page.goto(url.toString());
      await expect(studio).toBeVisible();
      await openStudioControls(studio);
      await expect(button('Rear deck')).toHaveAttribute('aria-pressed', 'true');
      await button('Render study').click();
      await expect(button('Current')).toHaveAttribute('aria-pressed', 'true');
    });

    test('shares a Lineup glide position and returns to the portfolio', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio&scene=lineup');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) =>
        studio.getByRole('button', { name, exact: true }).filter({ visible: true });
      await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await openStudioControls(studio);
      await button('Glide view').click();
      const stage = studio.getByRole('region', { name: 'Drag to orbit' });
      await stage.focus();
      await stage.press('ArrowRight');
      await stage.press('ArrowRight');
      await button('Share shot').click();
      const field = studio.getByRole('textbox', { name: 'Exact shot link' });
      const glide = new URL(await field.inputValue());
      expect(glide.searchParams.get('camera')).toBe('glide');
      expect(Number(glide.searchParams.get('glide'))).toBeGreaterThan(0);
      await button('Free orbit').click();
      await button('Overhead').click();
      await expect(button('Overhead')).toHaveAttribute('aria-pressed', 'true');
      await expect(button('Axle guides')).toBeVisible();
      await button('Back to portfolio').click();
      await expect(studio).toHaveCount(0);
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
    });
  });
}
