import { expect, test, type Page } from '@playwright/test';
import { openStudioControls, selectStudioExhibit } from './studioControls';

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Studio exhibits at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: phone, hasTouch: phone });

    async function openStudio(page: Page) {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?car=0');
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await page
        .getByRole('button', { name: 'Garage controls', exact: true })
        .filter({ visible: true })
        .click();
      await page.getByRole('option', { name: /^Explore Studio/ }).click();
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) => studio.getByRole('button', { name, exact: true });
      const picker = button('Studio exhibits');
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      const open = async (label: string) => {
        await selectStudioExhibit(studio, label);
        await expect(studio.getByRole('heading', { name: label, exact: true })).toBeVisible();
        await ready();
      };

      await ready();
      await openStudioControls(studio);
      await expect(button('Long lens')).toBeVisible();
      await expect(picker).toBeVisible({ timeout: 6000 });
      return { studio, button, picker, ready, open };
    }

    test('compares the Porsche Lineup and returns to the current pairing', async ({ page }) => {
      const { studio, button, picker, ready, open } = await openStudio(page);
      await picker.focus();
      await open('Porsche Lineup');
      await expect(picker).toBeFocused();
      await expect(studio.getByText('Matched wheelbases')).toBeVisible();
      await button('930 Turbo').click();
      await button('911 RWB').click();
      await expect(button('911 RWB')).toHaveAttribute('aria-pressed', 'true');
      await button('Both').click();
      await expect(button('Both')).toHaveAttribute('aria-pressed', 'true');
      await button('Current Lineup').click();
      await ready();
      await expect(
        studio.getByText('Ferrari F40 & Red Bull RB16B').filter({ visible: true }),
      ).toBeVisible();
    });

    test('explores Dusk lighting, the Miata cockpit and the brake reveal', async ({ page }) => {
      const { studio, button, open } = await openStudio(page);
      await open('Dusk lighting');
      const looks = studio.getByRole('combobox', { name: 'Studio lighting' });
      for (const name of ['studio', 'blackout', 'dusk']) {
        await looks.selectOption(name);
        await expect(looks).toHaveValue(name);
      }

      await open('Miata cockpit');
      await button('Exterior').click();
      await button('Cockpit').click();
      await expect(button('Cockpit')).toHaveAttribute('aria-pressed', 'true');

      await open('Brake reveal');
      await button('Straighten front wheel').click();
      await expect(button('Straight')).toHaveAttribute('aria-pressed', 'true');
      await button('Turn front wheel').click();
      await expect(button('Turned')).toHaveAttribute('aria-pressed', 'true');
    });

    test('restores the Corvette wear shot and returns to the original Garage', async ({ page }) => {
      const { studio, button, ready, open } = await openStudio(page);
      await open('Corvette race wear');
      await button('Wheel close-up').click();
      await button('Clean').click();
      await button('Share shot').click();
      const link = await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue();
      await page.goto(link);
      await ready();
      await openStudioControls(studio);
      await expect(button('Wheel close-up')).toHaveAttribute('aria-pressed', 'true');
      await expect(button('Clean')).toHaveAttribute('aria-pressed', 'true');
      await selectStudioExhibit(studio, 'Free orbit');
      await ready();
      await openStudioControls(studio);
      await expect(button('Long lens')).toBeVisible();
      await button('Choose car').click();
      const cars = page.getByRole('dialog', { name: 'Pick your ride.' });
      await expect(cars.locator('.car-option')).toHaveCount(12);
      await page.keyboard.press('Escape');
      await button('Back to Garage').click();
      await expect(studio).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: /^Browse cars\. Ferrari F40/ }).filter({ visible: true }),
      ).toBeVisible();
    });

    test('opens the photographed F40 shot and shares the adjusted angle', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/?garage=studio&car=0');
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      const photo = studio.getByRole('button', { name: 'Photo', exact: true });
      if (phone) {
        await expect(photo).toBeHidden();
        await expect(
          studio.getByRole('heading', { name: 'Ferrari F40', exact: true }),
        ).toBeVisible();
      }
      const trigger = studio.getByRole('button', { name: 'Studio exhibits', exact: true });
      await trigger.click();
      const gallery = studio.getByRole('dialog', { name: 'Studio exhibits', exact: true });
      const shot = gallery.getByRole('button', { name: /^F40 rear louvers/ });
      await expect(shot).toBeVisible();
      await expect
        .poll(() => shot.locator('img').evaluate((img) => (img as HTMLImageElement).naturalWidth))
        .toBe(640);
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await trigger.click();
      await shot.click();
      const heading = studio.getByRole('heading', { name: 'Rear louvers', exact: true });
      await expect(heading).toBeVisible();

      const stage = studio.getByRole('region', { name: 'Drag to orbit' });
      await stage.press('ArrowLeft');
      await openStudioControls(studio);
      await expect(photo).toBeVisible();
      await studio.getByRole('button', { name: 'Share shot', exact: true }).click();
      const link = new URL(
        await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue(),
      );
      expect(link.searchParams.get('louvers')).toBe('1');
      const moved = Number(link.searchParams.get('yaw'));
      expect(moved).toBeLessThan(3.04);
      await page.goto(link.toString());
      await expect(heading).toBeVisible();
      await expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      await openStudioControls(studio);
      await studio.getByRole('button', { name: 'Share shot', exact: true }).click();
      const reopened = new URL(
        await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue(),
      );
      expect(Number(reopened.searchParams.get('yaw'))).toBeCloseTo(moved, 3);
    });
  });
}
