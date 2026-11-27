import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test.describe(`work and garden at ${width}px`, () => {
    test.use({ viewport: { width, height }, hasTouch: width < 700, isMobile: width < 700 });
    test.beforeEach(async ({ page }) => {
      await page.route('**/*.glb', (route) => route.abort());
    });
    test('a personal flower keeps its note in the garden and on the sill', async ({ page }) => {
      const index = width === 1440 ? 0 : width === 390 ? 1 : 2;
      const name = ['Anemone', 'Gerbera', 'Ranunculus'][index];
      const note = 'You saved me the window seat on the train.';
      await page.goto('/#project-bloomnote');
      const garden = page.locator('#project-bloomnote');
      await garden.getByRole('button', { name, exact: true }).click();
      await garden.getByRole('button', { name: 'Write a note' }).click();
      await garden.getByRole('textbox').fill(note);
      await garden.getByRole('button', { name: 'Grow a flower' }).click();
      const inspect = garden.getByRole('button', { name: 'View full garden' });
      await inspect.click();
      const full = page.getByRole('dialog', { name: 'Full garden' });
      await expect(full.locator('blockquote')).toHaveText('“' + note + '”');
      await expect(full.locator('[aria-pressed="true"] .studio-flower-head')).toHaveCSS(
        'animation-name',
        'none',
      );
      await expect(full.getByRole('button', { name, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      await full.getByRole('button', { name: 'Close garden' }).click();
      await expect(inspect).toBeFocused();
      await inspect.click();
      await full.getByRole('button', { name: 'Edit your note' }).click();
      const updated = note + ' Again.';
      await full.getByRole('textbox').fill(updated);
      await full.getByRole('button', { name: 'Grow a flower' }).click();
      await expect(full.locator('blockquote')).toHaveText('“' + updated + '”');
      await full.getByRole('button', { name: 'Bean’s windowsill' }).click();
      const room = page.locator('#project-mrrp');
      const flower = room.getByRole('button', { name: `Read your ${name} note on the windowsill` });
      await expect(flower).toBeInViewport({ ratio: 0.95 });
      await expect(room.getByRole('status')).toContainText(
        `Tap your ${name.toLowerCase()} on the sill`,
      );
      await flower.click();
      await expect(room.getByRole('status')).toHaveText(updated);
      await room.getByRole('button', { name: 'Pet Bean', exact: true }).click();
      await expect(room.getByRole('status')).toContainText('Mrrp');
    });
    test('Iodine shows the recorded decision for the selected folder', async ({ page }) => {
      await page.goto('/cases/iodine/');
      const scope = page.getByRole('region', { name: 'What an approval covers' });
      const inside = scope.getByRole('button', { name: 'Inside scope' });
      const outside = scope.getByRole('button', { name: 'Outside scope' });
      await expect(inside).toHaveAttribute('aria-pressed', 'true');
      await outside.click();
      await expect(scope).toContainText('Fresh approval needed');
      await expect(outside).toHaveAttribute('aria-pressed', 'true');
      await inside.click();
      await expect(scope).toContainText('Approval reused');
    });
    test('Close and Back restore the selected index row and disclosure', async ({ page }) => {
      await page.goto('/work/');
      await page.getByRole('link', { name: 'Experience', exact: true }).click();
      await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeInViewport();
      const first = page.getByRole('button', { name: /Replaced a live PHP backend/ });
      if (width < 700) {
        const story = await first.locator('.experience-story').boundingBox();
        const row = await first.boundingBox();
        expect(story!.width / row!.width).toBeGreaterThan(0.9);
      }
      await page.locator('.experience-more summary').click();
      const row = page.getByRole('button', { name: /Google Ad Manager native ads/ });
      await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      const position = (await row.boundingBox())!.y;
      await row.click();
      await page.getByRole('button', { name: 'Next case study' }).click();
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(page).toHaveURL(/\/work\/#experience$/);
      await expect(row).toBeFocused();
      await expect
        .poll(async () => Math.abs((await row.boundingBox())!.y - position))
        .toBeLessThan(3);
      await page.goForward();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.goBack();
      await expect(row).toBeFocused();
      await expect(page.locator('.experience-more')).toHaveJSProperty('open', true);
      const platform = page.getByRole('link', { name: /platform One account/ });
      await platform.click();
      await page.getByRole('button', { name: 'Close', exact: true }).press('Escape');
      await expect(platform).toBeFocused();
    });
  });
}
