import { expect, test } from '@playwright/test';
import { openStudioControls } from './studioControls';

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Garage continuity at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: phone, isMobile: phone });

    test('retains the outgoing car name and the rear lens on a slow swap', async ({ page }) => {
      let release = () => {};
      const hold = new Promise<void>((resolve) => {
        release = resolve;
      });
      await page.route('**/mercedes-benz-w198-300-sl.glb', async (route) => {
        await hold;
        await route.continue();
      });
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      try {
        await page.goto('/?garage=studio&car=0');
        const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
        await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
        await openStudioControls(studio);
        await studio.getByRole('button', { name: 'Rear', exact: true }).click();
        await studio.getByRole('button', { name: 'Choose car', exact: true }).click();
        const picker = page.getByRole('dialog', { name: 'Pick your ride.' });
        await picker.getByRole('button', { name: /^Show Mercedes 300 SL,/ }).click();
        await expect(picker).toBeHidden();
        const status = studio.getByRole('status').filter({ hasText: 'Loading Mercedes 300 SL' });
        await expect(status).toBeVisible();
        expect((await status.boundingBox())!.y).toBeGreaterThan(422);
        await expect(
          studio.getByText('Ferrari F40', { exact: true }).filter({ visible: true }),
        ).toBeVisible();
        await expect
          .poll(() =>
            status.locator('img').evaluate((img) => (img as HTMLImageElement).naturalWidth),
          )
          .toBeGreaterThan(0);
        release();
        await expect(
          studio.getByText('Mercedes 300 SL', { exact: true }).filter({ visible: true }),
        ).toBeVisible({
          timeout: 60_000,
        });
        await expect(studio).toHaveAttribute('data-ready', 'true');
        await studio.getByRole('button', { name: 'Share shot', exact: true }).click();
        const url = new URL(
          await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue(),
        );
        expect(url.searchParams.get('car')).toBe('1');
        expect(url.searchParams.get('camera')).toBe('profile');
        expect(Number(url.searchParams.get('yaw'))).toBeCloseTo(2.53, 2);
      } finally {
        release();
      }
    });

    test('shares the signature camera and lighting together', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio&car=3');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await openStudioControls(studio);
      const signature = studio.locator('#studio-full-dock').getByRole('button', {
        name: 'Signature view',
        exact: true,
      });
      const lighting = studio.getByRole('combobox', { name: 'Studio lighting' });
      await expect(signature).toBeVisible();
      await signature.evaluate((preset: HTMLButtonElement) => {
        const lights = preset
          .closest('.garage-studio')!
          .querySelector('select.studio-light-picker') as HTMLSelectElement;
        preset.click();
        lights.value = 'dusk';
        lights.dispatchEvent(new Event('change', { bubbles: true }));
      });
      await expect(lighting).toHaveValue('dusk');
      await studio.getByRole('button', { name: 'Share shot', exact: true }).click();
      const url = new URL(
        await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue(),
      );
      expect(url.searchParams.get('car')).toBe('3');
      expect(url.searchParams.get('camera')).toBe('wheel');
      expect(url.searchParams.get('studioLook')).toBe('dusk');
      expect(Number(url.searchParams.get('yaw'))).toBeCloseTo(0.96, 2);
      await page.goto(url.toString());
      await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await openStudioControls(studio);
      await expect(lighting).toHaveValue('dusk');
      await expect(
        studio.getByText('Porsche 911 RWB', { exact: true }).filter({ visible: true }),
      ).toBeVisible();
    });
  });
}
