import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PNG } from 'pngjs';

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Garage Studio at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: phone, hasTouch: phone });

    test('opens all Studio views, restores a mechanical shot, and saves a framed photo', async ({
      page,
    }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?car=0&paint=%23702c43&light=night');
      const garage = page
        .getByRole('button', { name: 'All controls', exact: true })
        .filter({ visible: true });
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await garage.click();
      await page.getByRole('option', { name: /^Explore Studio/ }).click();
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) => studio.getByRole('button', { name, exact: true });
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await ready();
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeHidden();

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
      const looks = studio.getByRole('group', { name: 'View options' });
      await expect(looks.getByRole('button', { name: 'Blackout' })).toBeVisible();
      await looks.getByRole('button', { name: 'Blackout' }).click();
      await expect(looks.getByRole('button', { name: 'Blackout' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );

      await button('Details').click();
      await ready();
      await button('Open DRS').click();
      await button('Share shot').click();
      const link = new URL(
        await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue(),
      );
      expect(link.searchParams.get('part')).toBe('up');
      expect(link.searchParams.get('garage')).toBe('studio');
      const shared = await page.context().newPage();
      await shared.goto(link.toString());
      const sharedStudio = shared.getByRole('dialog', { name: 'Garage Studio' });
      await expect(sharedStudio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await expect(sharedStudio.getByRole('button', { name: 'Close DRS' })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await shared.close();

      await button('Lineup').click();
      await ready();
      await button('Overhead').click();
      await expect(button('Overhead')).toHaveAttribute('aria-pressed', 'true');
      await button('Axle guides').click();
      await expect(button('Axle guides')).toHaveAttribute('aria-pressed', 'true');
      await button('Photo').click();
      if (!phone) await button('Landscape 16:9').click();
      await button('Capture').click();
      await expect(studio.getByRole('img', { name: 'Captured studio photograph' })).toBeVisible();
      const download = page.waitForEvent('download');
      await button('Save photo').click();
      const saved = await download;
      const { width: photoWidth, height: photoHeight } = PNG.sync.read(
        await readFile((await saved.path())!),
      );
      expect(photoWidth / photoHeight).toBeCloseTo(phone ? 4 / 5 : 16 / 9, 2);

      await button('Back to Garage').click();
      await expect(studio).toHaveCount(0);
      await expect(garage).toBeFocused();
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
      await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
      expect(new URL(page.url()).searchParams.get('light')).toBe('night');
    });
  });
}
