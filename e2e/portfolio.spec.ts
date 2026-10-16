import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PNG } from 'pngjs';

async function accessible(page: Page) {
  const report = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    report.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
  ).toEqual([]);
}

function carPixels(bytes: Buffer): number {
  const { width, height, data } = PNG.sync.read(bytes);
  let red = 0;
  // Exclude the paint buttons, so they cannot make a blank scene pass.
  for (let y = Math.floor(height * 0.3); y < height * 0.78; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const offset = (y * width + x) * 4;
      if (
        data[offset] > 60 &&
        data[offset] > data[offset + 1] * 1.4 &&
        data[offset] > data[offset + 2] * 1.4
      )
        red++;
    }
  }
  return red;
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
  await page.route('**/_vercel/**', (route) =>
    route.fulfill({ body: '', contentType: 'application/javascript' }),
  );
});

for (const width of [1440, 390]) {
  test.describe(`${width}px interface`, () => {
    test.use({
      viewport: { width, height: 900 },
      isMobile: width === 390,
      hasTouch: width === 390,
    });
    test(`rendering, navigation and accessible dialogs at ${width}px`, async ({
      page,
      context,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
      await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
      await expect.poll(async () => carPixels(await page.screenshot())).toBeGreaterThan(1000);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
      await accessible(page);

      const carTrigger = page
        .getByRole('button', { name: /Browse cars\./ })
        .filter({ visible: true });
      await carTrigger.click();
      await expect(page.getByRole('dialog', { name: 'Pick your ride.' })).toBeVisible();
      await accessible(page);
      await page.keyboard.press('Escape');
      await expect(carTrigger).toBeFocused();

      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible();
      await accessible(page);
      await page.keyboard.press('Escape');

      if (width === 390) {
        await page.locator('.portfolio-menu summary').click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name: 'Projects' })
          .click();
      } else {
        await page.locator('#nav').getByRole('link', { name: 'Projects', exact: true }).click();
      }
      await expect(page.locator('#sec-work h2')).toBeInViewport();
      const carBefore = new URL(page.url()).searchParams.get('car');
      if (width !== 390) {
        await page.mouse.wheel(150, 0);
        await page.evaluate(
          () =>
            new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
        );
        expect(new URL(page.url()).searchParams.get('car')).toBe(carBefore);
      }
      await accessible(page);

      const story = page.getByRole('button', { name: 'How I built it: bloomnote', exact: true });
      await story.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      const closeStory = page.getByRole('button', { name: 'Close', exact: true });
      await expect(closeStory).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.getByRole('button', { name: 'Share link', exact: true })).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(closeStory).toBeFocused();
      await accessible(page);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
      const shared = page.url();
      await page.keyboard.press('Escape');
      await expect(story).toBeFocused();
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');

      const screenshot = page.getByRole('button', {
        name: 'Inspect screenshot: bloomnote',
        exact: true,
      });
      await screenshot.click();
      await expect(page.getByRole('dialog', { name: 'bloomnote screenshot' })).toBeVisible();
      const viewer = page.getByRole('dialog', { name: 'bloomnote screenshot' });
      const image = viewer.getByRole('img');
      const firstView = await image.getAttribute('src');
      await viewer.getByRole('button', { name: 'Next →', exact: true }).click();
      await expect(image).not.toHaveAttribute('src', firstView!);
      await expect(viewer.getByRole('group', { name: 'Screenshot views' })).toContainText('2 / 2');
      await page.keyboard.press('ArrowLeft');
      await expect(image).toHaveAttribute('src', firstView!);
      await page.keyboard.press('ArrowLeft');
      await expect(image).not.toHaveAttribute('src', firstView!);
      await viewer.getByRole('button', { name: 'Previous', exact: false }).click();
      await expect(image).toHaveAttribute('src', firstView!);
      await page.keyboard.press('ArrowRight');
      await expect(image).not.toHaveAttribute('src', firstView!);
      await page.keyboard.press('ArrowRight');
      await expect(image).toHaveAttribute('src', firstView!);
      for (const forcedColors of ['none', 'active'] as const) {
        await page.emulateMedia({ forcedColors });
        await viewer.getByRole('button', { name: 'Next →', exact: true }).focus();
        await page.screenshot({
          path: test.info().outputPath(`details2-viewer-${width}-${forcedColors}.png`),
          animations: 'disabled',
        });
      }
      await page.emulateMedia({ forcedColors: 'none' });

      await accessible(page);
      await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Fit image', exact: true })).toBeVisible();
      await page.keyboard.press('ArrowRight');
      await expect(image).toHaveAttribute('src', firstView!);
      await page.keyboard.press('Escape');
      await expect(screenshot).toBeFocused();

      if (width === 390) {
        await page.locator('.portfolio-menu summary').click();
        await page
          .getByRole('navigation', { name: 'Mobile navigation' })
          .getByRole('link', { name: 'Contact' })
          .click();
      } else {
        await page.locator('#nav').getByRole('link', { name: 'Contact', exact: true }).click();
      }
      await expect(page.locator('#sec-contact h2')).toBeInViewport();
      const credits = page.getByRole('button', { name: /3D model credits/ });
      await credits.click();
      await expect(page.getByRole('dialog', { name: '3D model credits' })).toBeVisible();
      await accessible(page);
      expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
      await page.keyboard.press('Escape');
      await expect(credits).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');

      const cold = await context.newPage();
      await cold.goto(shared);
      await expect(cold.getByRole('dialog')).toBeVisible();
      await cold.close();
      expect(errors).toEqual([]);
    });
  });
}

test('a delayed effects download does not block content or the model request', async ({ page }) => {
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let waiting = false;
  await page.route('**/Effects-*.js', async (route) => {
    waiting = true;
    await held;
    await route.continue();
  });
  const model = page.waitForRequest('**/models/ferrari-f120-f40.glb');
  const effectsDownloaded = page.waitForResponse('**/Effects-*.js');
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect.poll(() => waiting).toBe(true);
    await model;
    await expect(page.getByRole('heading', { name: 'Aiden Jang', exact: true })).toBeVisible();
  } finally {
    release();
  }
  await effectsDownloaded;
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
});
