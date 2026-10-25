import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

test.beforeEach(async ({ page }) => {
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
});

test('phone navigation uses the persistent menu without intro-only section dots', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.locator('#mobile-bar')).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Section progress' }).filter({ visible: true }),
  ).toHaveCount(0);
  await page.locator('.portfolio-menu summary').click();
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(navigation.getByRole('link')).toHaveCount(5);
  await navigation.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.locator('#sec-about h2')).toBeInViewport();
  await page.locator('.portfolio-menu summary').click();
  await navigation.getByRole('link', { name: 'Intro', exact: true }).click();
  await expect(page.locator('#mobile-bar')).toBeVisible();
});

test('phone controls have a touch close action and omit keyboard instructions', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { value: async () => {}, configurable: true });
  });
  await page.goto('/');
  const controls = page
    .getByRole('button', { name: 'All controls', exact: true })
    .filter({ visible: true });
  await controls.click();
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
  await expect(controls).toBeFocused();
  for (const width of [320, 844]) {
    await page.setViewportSize({ width, height: 844 });
    await controls.click();
    await expect(dialog.locator('.keyboard-hint').filter({ visible: true })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close controls', exact: true }).click();
    await expect(controls).toBeFocused();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole('button', { name: /Browse cars\./ })
    .filter({ visible: true })
    .click();
  await expect(
    page.getByText('Arrow keys to browse · Enter to choose', { exact: true }),
  ).toBeHidden();
  await page.getByRole('button', { name: 'Close car browser', exact: true }).click();
});

test('a delayed next car keeps loading feedback below the phone header', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/models/mercedes-benz-w198-300-sl.glb', async (route) => {
    await held;
    await route.continue();
  });
  try {
    await page.goto('/');
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    await page
      .getByRole('button', { name: 'Next car', exact: true })
      .filter({ visible: true })
      .click();
    const loading = page.getByRole('status', { name: 'Loading Mercedes 300 SL', exact: true });
    await expect(loading).toBeVisible();
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: width === 320 ? 568 : 844 });
      const banner = await loading.boundingBox();
      const header = await page.locator('.portfolio-header').boundingBox();
      expect(
        banner!.y,
        'the complete loading banner clears Menu and Résumé',
      ).toBeGreaterThanOrEqual(header!.y + header!.height);
      expect(banner!.x).toBeGreaterThanOrEqual(0);
      expect(banner!.x + banner!.width).toBeLessThanOrEqual(width);
      await page.screenshot({ path: test.info().outputPath(`phone-loading-${width}.png`) });
    }
  } finally {
    release();
  }
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await expect(page.locator('.car-loading-progress')).toHaveAttribute('aria-hidden', 'true');
});
