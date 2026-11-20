import { expect, test } from '@playwright/test';

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Studio exhibits at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: phone, hasTouch: phone });

    test('opens the five exhibits and returns to the original Garage', async ({ page }) => {
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.goto('/');
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await page
        .getByRole('button', { name: 'All controls', exact: true })
        .filter({ visible: true })
        .click();
      await page.getByRole('option', { name: /^Explore Studio/ }).click();
      const studio = page.getByRole('dialog', { name: 'Garage Studio', exact: true });
      const button = (name: string) => studio.getByRole('button', { name, exact: true });
      const picker = studio.getByRole('combobox', { name: 'Studio exhibits' });
      const ready = () => expect(studio).toHaveAttribute('data-ready', 'true', { timeout: 60_000 });
      const open = async (label: string) => {
        await picker.selectOption({ label });
        await expect(studio.getByRole('heading', { name: label, exact: true })).toBeVisible();
        await ready();
      };

      await ready();
      await expect(button('Long lens')).toBeVisible();
      await expect(picker).toBeVisible({ timeout: 6000 });
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
      await expect(studio.getByText('Ferrari F40 & Red Bull RB16B')).toBeVisible();

      await open('Dusk lighting');
      const looks = studio.getByRole('group', { name: 'Lighting comparison' });
      for (const name of ['Studio', 'Blackout', 'Dusk']) {
        const look = looks.getByRole('button', { name, exact: true });
        await look.click();
        await expect(look).toHaveAttribute('aria-pressed', 'true');
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

      await open('Corvette race wear');
      await button('Wheel close-up').click();
      await button('Clean').click();
      await button('Share shot').click();
      const link = await studio.getByRole('textbox', { name: 'Exact shot link' }).inputValue();
      await page.goto(link);
      await ready();
      await expect(button('Wheel close-up')).toHaveAttribute('aria-pressed', 'true');
      await expect(button('Clean')).toHaveAttribute('aria-pressed', 'true');
      await picker.selectOption({ label: 'Studio exhibits' });
      await ready();
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
  });
}
