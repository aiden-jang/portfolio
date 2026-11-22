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
  await expect(page.locator('#mobile-bar').getByText('Garage', { exact: true })).toBeVisible();
  await expect(
    page.locator('#sec-intro').getByRole('link', { name: 'Featured work' }),
  ).toHaveAttribute('href', '#sec-work');
  await expect(
    page.getByRole('navigation', { name: 'Section progress' }).filter({ visible: true }),
  ).toHaveCount(0);
  await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(navigation.getByRole('link')).toHaveCount(6);
  await navigation.getByRole('link', { name: 'More projects', exact: true }).click();
  await expect(page.locator('#sec-more-work h2')).toBeInViewport();
  await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
  await navigation.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page.locator('#sec-about h2')).toBeInViewport();
  await page.getByRole('button', { name: /^Menu(?:$|: )/ }).click();
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
    .getByRole('button', { name: 'Garage controls', exact: true })
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

test('a slow car swap keeps its status clear of the header and controls', async ({ page }) => {
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
    const loading = page.getByRole('status', { name: 'Loading Porsche 911 GT3 RS', exact: true });
    await expect(loading).toBeVisible();
    for (const [width, height] of [
      [320, 568],
      [390, 844],
      [1440, 900],
    ]) {
      await page.setViewportSize({ width, height });
      const dock = page.locator(width < 768 ? '#mobile-bar' : '#desktop-dock');
      await expect
        .poll(async () => {
          const banner = await loading.boundingBox();
          const header = await page.locator('.portfolio-header').boundingBox();
          const controls = await dock.locator('.car-controls-row').boundingBox();
          return Boolean(
            banner &&
            header &&
            controls &&
            banner.y >= header.y + header.height &&
            banner.y + banner.height <= controls.y - 12 &&
            banner.x >= 0 &&
            banner.x + banner.width <= width,
          );
        })
        .toBe(true);
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
