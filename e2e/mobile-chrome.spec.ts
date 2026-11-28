import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.beforeEach(async ({ page }) => {
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
});

test('phone navigation jumps to Experience and Projects on the homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#mobile-bar')).toBeVisible();
  await expect(page.locator('#mobile-bar').getByText('Garage', { exact: true })).toBeVisible();
  await expect(
    page.locator('#sec-intro').getByRole('link', { name: 'Featured work' }),
  ).toHaveAttribute('href', '#sec-work');
  await expect(
    page.getByRole('navigation', { name: 'Section progress' }).filter({ visible: true }),
  ).toHaveCount(0);
  const nav = page.getByRole('navigation', { name: 'Portfolio navigation' });
  await nav.getByRole('link', { name: 'Experience', exact: true }).tap();
  await expect(page.getByRole('heading', { name: 'Experience', exact: true })).toBeInViewport();
  await nav.getByRole('link', { name: 'Projects', exact: true }).tap();
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeInViewport();
  await expect(page.locator('#sec-more-work #project-iodine')).toBeInViewport();
  await page.getByRole('button', { name: 'Aiden Jang, back to the top' }).tap();
  await expect(page.locator('#mobile-bar')).toBeVisible();
});

test('phone controls have a touch close action and omit keyboard instructions', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async () => {}, configurable: true });
  });
  // Exercise the touch controls while the lazy 3D scene is still loading.
  await page.route('**/assets/Scene-*.js', () => {});
  await page.goto('/');
  const brand = page.getByRole('button', { name: 'Aiden Jang, back to the top' });
  await brand.focus();
  await page.keyboard.press('Control+k');
  const dialog = page.getByRole('dialog', { name: 'Command menu' });
  await expect(
    dialog.getByText('↑ ↓ browse · Home End jump · Enter run', { exact: true }),
  ).toBeHidden();
  await expect(dialog.locator('#command-repaint > span').last()).toBeHidden();
  await expect(dialog.getByText(/^(⌘|Ctrl|ESC)$/).filter({ visible: true })).toHaveCount(0);
  await dialog.getByRole('combobox', { name: 'Search portfolio controls' }).fill('share');
  await dialog.getByRole('option', { name: /Share this garage/ }).click();
  await expect(dialog.getByText('Garage shared', { exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'Close controls', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(brand).toBeFocused();
  await page.setViewportSize({ width: 320, height: 844 });
  await page.keyboard.press('Control+k');
  await expect(dialog.locator('.keyboard-hint').filter({ visible: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close controls', exact: true }).tap();
  await expect(brand).toBeFocused();

  await page.setViewportSize({ width: 844, height: 844 });
  await brand.focus();
  await page.keyboard.press('Control+k');
  await expect(dialog.locator('.keyboard-hint').filter({ visible: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close controls', exact: true }).tap();
  await expect(brand).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', { name: /Browse cars\./ })
    .filter({ visible: true })
    .tap();
  await expect(
    page.getByText('Arrow keys to browse · Enter to choose', { exact: true }),
  ).toBeHidden();
  await page.getByRole('button', { name: 'Close car browser', exact: true }).click();
});

test('a slow car swap keeps its loading feedback above the dock', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/models/porsche-992-gt3-rs.glb', async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto('/?car=0');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await page.getByRole('button', { name: /Browse cars. Ferrari F40/ }).click();
    await page.getByRole('button', { name: 'Show Porsche 911 GT3 RS, 992', exact: true }).click();
    const carName = page
      .getByRole('button', { name: /Browse cars. Porsche 911 GT3 RS/ })
      .filter({ visible: true });
    await expect(carName).toHaveAttribute('aria-busy', 'true');
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      const dock = page.locator(width < 768 ? '#mobile-bar' : '#desktop-dock');
      const nameSlot = dock.locator('.car-browse-trigger');
      const status = nameSlot.getByText(/Loading…/);
      await expect(nameSlot).toHaveAttribute('aria-busy', 'true');
      await expect(status).toBeInViewport();
      const slot = (await nameSlot.boundingBox())!;
      const label = (await status.boundingBox())!;
      expect(label.x).toBeGreaterThanOrEqual(slot.x);
      expect(label.y).toBeGreaterThanOrEqual(slot.y);
      expect(label.y + label.height).toBeLessThanOrEqual(slot.y + slot.height + 1);
      const progress = page.getByRole('status', { name: 'Loading Porsche 911 GT3 RS' });
      await expect(progress.getByRole('progressbar')).toBeInViewport();
      const progressBox = (await progress.boundingBox())!;
      const dockBox = (await dock.boundingBox())!;
      expect(progressBox.y + progressBox.height).toBeLessThanOrEqual(dockBox.y);
      expect(progressBox.x).toBeGreaterThanOrEqual(0);
      expect(progressBox.x + progressBox.width).toBeLessThanOrEqual(width + 1);
      await page.screenshot({ path: test.info().outputPath(`loading-${width}.png`) });
    }
  } finally {
    release();
  }
  await expect(page.locator('.car-loading-progress')).toHaveAttribute('aria-hidden', 'true', {
    timeout: 60_000,
  });
  await expect(page.locator('.car-choice-status').first()).toHaveText('');
});
