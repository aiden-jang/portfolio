import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

const redBull = '**/models/red-bull-rb16b.glb';

async function garageFrame(page: Page) {
  const { width, height } = page.viewportSize()!;
  return PNG.sync.read(
    await page.screenshot({
      clip: { x: 0, y: Math.floor(height * 0.3), width, height: Math.floor(height * 0.41) },
    }),
  );
}

function difference(before: PNG, after: PNG) {
  let difference = 0;
  for (let index = 0; index < before.data.length; index += 4) {
    if (Math.abs(before.data[index] - after.data[index]) > 30) difference++;
  }
  return difference;
}

function modelColors(image: PNG) {
  let red = 0;
  let yellow = 0;
  for (let index = 0; index < image.data.length; index += 4) {
    const [r, g, b] = image.data.subarray(index, index + 3);
    if (r > 100 && r > g * 2.2 && r > b * 2.2) red++;
    if (r > 110 && g > r * 0.55 && g > b * 2 && r > g * 1.05) yellow++;
  }
  return { red, yellow };
}

for (const width of [1440, 390]) {
  const phone = width < 768;
  test.describe(`Lineup at ${width}px`, () => {
    test.use({ viewport: { width, height: 844 }, isMobile: phone, hasTouch: phone });

    test('opens from Garage and restores the single-car setup on exit', async ({ page }) => {
      let modelRequests = 0;
      await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
      await page.route(redBull, (route) => {
        modelRequests++;
        // Recovered downloads must not change the preceding car or selected lighting.
        return phone && modelRequests === 1 ? route.abort('failed') : route.continue();
      });
      await page.goto('/?car=0&paint=%23702c43&light=night');
      const garage = page
        .getByRole('button', { name: 'Garage controls', exact: true })
        .filter({ visible: true });
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Browse cars\. Ferrari F40/ }).filter({ visible: true }),
      ).toBeEnabled();
      expect(modelRequests).toBe(0);
      const initialSetup = new URL(page.url()).search;
      await garage.press('Control+k');
      const menu = page.getByRole('dialog', { name: 'Command menu' });
      await expect(menu.getByRole('option', { name: /^Lineup/ })).toBeVisible({ timeout: 5_000 });
      await menu.getByRole('option', { name: /^Lineup/ }).click();

      const lineup = page.getByRole('dialog', { name: 'Lineup', exact: true });
      const exit = lineup.getByRole('button', { name: 'Back to Garage' });
      await expect(exit).toBeFocused();
      await expect(garage).toBeHidden();
      if (phone) {
        await expect(lineup.getByRole('status')).toHaveText('The lineup couldn’t load.');
        await lineup.getByRole('button', { name: 'Retry' }).click();
      }
      const opening = lineup.getByRole('button', { name: 'Opening', exact: true });
      const side = lineup.getByRole('button', { name: 'Side view', exact: true });
      await expect(opening).toBeEnabled({ timeout: 60_000 });
      await expect(opening).toHaveAttribute('aria-pressed', 'true');
      await expect(lineup.getByText('≈ 5.64 m long')).toBeVisible();
      await expect(page.locator('.portfolio-scene canvas')).toHaveCount(1);
      expect(new URL(page.url()).search).toBe(initialSetup);
      await expect
        .poll(
          async () => {
            const { red, yellow } = modelColors(await garageFrame(page));
            return red > 100 && yellow > 25;
          },
          { timeout: 12_000 },
        )
        .toBe(true);

      const openingFrame = await garageFrame(page);
      await side.click();
      await expect(side).toHaveAttribute('aria-pressed', 'true');
      await expect
        .poll(async () => difference(openingFrame, await garageFrame(page)))
        .toBeGreaterThan(500);
      const sideFrame = await garageFrame(page);
      const stage = lineup.getByRole('region', { name: 'Orbit both cars' });
      await stage.focus();
      await page.keyboard.press('ArrowRight');
      await expect(side).toHaveAttribute('aria-pressed', 'false');
      await expect
        .poll(async () => difference(sideFrame, await garageFrame(page)))
        .toBeGreaterThan(500);

      await page.keyboard.press('Shift+Tab');
      await expect(lineup.getByText('Scale and model credits')).toBeFocused();
      if (phone) await exit.click();
      else await page.keyboard.press('Escape');
      await expect(lineup).toHaveCount(0);
      await expect(garage).toBeFocused();
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Lighting: After Hours/ }).filter({ visible: true }),
      ).toBeVisible();
      expect(new URL(page.url()).search).toBe(initialSetup);
      if (phone) {
        await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name: 'Contact', exact: true })
          .click();
      } else {
        await page.locator('#nav').getByRole('link', { name: 'Contact', exact: true }).click();
      }
      await expect(page.locator('body')).toHaveAttribute('data-contact-view', 'visible');
      await page.keyboard.press('?');
      await expect(menu).toBeVisible();
      await expect(menu.getByRole('option', { name: /^Lineup/ })).toHaveCount(0);
      await page.keyboard.press('Escape');
      await page.mouse.move(width / 2, 540);
      await page.mouse.down();
      await page.mouse.move(width / 2 + 60, 530, { steps: 4 });
      await expect(page.locator('body')).not.toHaveClass(/orbiting/);
      await page.mouse.up();
    });
  });
}
