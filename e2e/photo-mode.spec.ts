import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';
import AxeBuilder from '@axe-core/playwright';
for (const width of [1440, 390, 320]) {
  test.describe(`${width}px photo mode`, () => {
    test.use({
      viewport: { width, height: 844 },
      isMobile: width < 768,
      hasTouch: width < 768,
      deviceScaleFactor: width < 768 ? 2 : 1,
    });
    test('captures a real postcard, downloads it and restores the portfolio', async ({ page }) => {
      await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
      await page.route('**/_vercel/**', (r) => r.fulfill({ body: '' }));
      if (width < 768)
        await page.addInitScript(() => {
          Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => true });
          Object.defineProperty(navigator, 'share', {
            configurable: true,
            value: async (data: ShareData) => {
              const file = data.files?.[0];
              if (!file || file.type !== 'image/png' || file.size < 1000)
                throw new Error('Invalid photo');
              document.documentElement.dataset.photoShared = file.name;
            },
          });
        });
      await page.addInitScript(() => {
        const original = HTMLCanvasElement.prototype.toBlob;
        let fail = true;
        HTMLCanvasElement.prototype.toBlob = function (...args: Parameters<typeof original>) {
          if (fail) {
            fail = false;
            throw new Error('Simulated capture failure');
          }
          return original.apply(this, args);
        };
      });
      await page.goto('/?car=0');
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60000 });
      const trigger = page
        .getByRole('button', { name: 'Photo mode', exact: true })
        .filter({ visible: true });
      await trigger.click();
      const photo = page.getByRole('region', { name: 'Photo mode' });
      await expect(photo).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeHidden();
      await expect(photo.getByRole('button', { name: 'Exit photo mode' })).toBeFocused();
      expect(
        (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
          .violations,
      ).toEqual([]);
      const camera = photo.getByRole('combobox', { name: 'Camera view' });
      await expect(camera.getByRole('option', { name: 'Rear three-quarter' })).toHaveCount(1);
      await expect(camera.getByRole('option', { name: 'Front wheel close-up' })).toHaveCount(1);
      await camera.selectOption('profile');
      await page.screenshot({ path: test.info().outputPath('photo-mode.png') });
      await photo.getByRole('button', { name: 'Capture photo', exact: true }).click();
      await expect(photo.getByRole('status')).toHaveText('Capture is unavailable. Try again.');
      await expect(photo.getByRole('button', { name: 'Exit photo mode' })).toBeEnabled();
      await photo.getByRole('button', { name: 'Capture photo', exact: true }).click();
      await expect(photo.getByRole('img', { name: 'Your showroom postcard' })).toBeVisible({
        timeout: 20000,
      });
      await page.screenshot({ path: test.info().outputPath('photo-preview.png') });
      if (width < 768) {
        await photo.getByRole('button', { name: 'Share image', exact: true }).click();
        await expect(page.locator('html')).toHaveAttribute(
          'data-photo-shared',
          'showroom-ferrari-f40.png',
        );
      }
      const download = page.waitForEvent('download');
      await photo.getByRole('button', { name: 'Save image', exact: true }).click();
      const file = await download;
      expect(file.suggestedFilename()).toBe('showroom-ferrari-f40.png');
      await file.saveAs(test.info().outputPath('postcard.png'));
      const png = PNG.sync.read(await readFile((await file.path())!));
      expect(png.width).toBeGreaterThanOrEqual(width);
      expect(png.height).toBeGreaterThan(844);
      let red = 0;
      for (let i = 0; i < png.data.length; i += 4) {
        if (
          png.data[i] > 60 &&
          png.data[i] > png.data[i + 1] * 1.4 &&
          png.data[i] > png.data[i + 2] * 1.4
        )
          red++;
      }
      expect(red, 'the exported image contains the rendered red car').toBeGreaterThan(2000);
      await photo.getByRole('button', { name: 'Retake', exact: true }).click();
      await expect(photo.getByRole('button', { name: 'Capture photo', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(photo).toHaveCount(0);
      await expect(trigger).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('');
      await page.evaluate(() => (location.hash = 'sec-contact'));
      await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
      await page.keyboard.press('Control+k');
      await page.getByRole('combobox', { name: 'Search portfolio controls' }).fill('photo');
      await expect(page.getByRole('option', { name: /Photo mode/ })).toHaveCount(0);
    });
  });
}
