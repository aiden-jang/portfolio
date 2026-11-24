import { expect, test } from '@playwright/test';
import { clickStudioAdvanced, openStudioControls, selectStudioExhibit } from './studioControls';

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Studio mechanics at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, hasTouch: phone, isMobile: phone });
    test('reopens both race wings at the shared state', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio&car=0');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) => studio.getByRole('button', { name, exact: true });
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });

      await selectStudioExhibit(studio, 'Rear wings');
      await openStudioControls(studio);
      await expect(button('F40 deck')).toHaveAttribute('aria-pressed', 'true');
      await button('Race pairing').click();
      await ready();
      await expect(
        studio.getByText('Red Bull RB16B & Ferrari F1-75').filter({ visible: true }),
      ).toBeVisible();
      await button('Open DRS').click();
      await clickStudioAdvanced(studio, 'Share shot');
      const url = await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue();
      await page.goto(url);
      await ready();
      await openStudioControls(studio);
      await expect(button('Close DRS')).toHaveAttribute('aria-pressed', 'true');
    });

    test('switches the Miata lights and opens the fixed-angle comparison', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio&exhibit=lamps');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) => studio.getByRole('button', { name, exact: true });
      await expect(studio).toBeVisible();
      await openStudioControls(studio);
      await button('Raise lights').click();
      await expect(button('Lower lights')).toHaveAttribute('aria-pressed', 'true');
      await button('Compare states').click();
      const comparison = page.getByRole('dialog', { name: 'Miata pop-up headlights' });
      await expect(comparison).toBeVisible();
      await expect
        .poll(() =>
          comparison.getByRole('img').evaluate((image) => (image as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
      await page.keyboard.press('Escape');
      await expect(comparison).toBeHidden();
      await expect(studio).toBeVisible();
    });

    test('aligns the Porsche front axles and makes fine detail configurable', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio&exhibit=porsche');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) => studio.getByRole('button', { name, exact: true });
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await ready();
      await ready();
      await openStudioControls(studio);
      await button('Align front axles').click();
      await ready();
      await expect(button('Front axle guide')).toHaveAttribute('aria-pressed', 'true');
      await button('Front axle guide').click();
      await expect(button('Front axle guide')).toHaveAttribute('aria-pressed', 'false');

      await selectStudioExhibit(studio, 'Fine detail');
      await ready();
      await button('RWB spokes').click();
      await ready();
      await expect(button('Smooth edges')).toHaveAttribute('aria-pressed', 'true');
      await button('Smooth edges').click();
      await expect(button('Smooth edges')).toHaveAttribute('aria-pressed', 'false');
    });
  });
}
