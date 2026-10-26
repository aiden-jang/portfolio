import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PNG } from 'pngjs';
import { GARAGE_INDICES } from '../src/config';

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

async function expectVisibleCar(page: Page, timeout = 20_000) {
  // Retry capture errors within the same budget as frames that have not drawn the car.
  await expect(async () => {
    const pixels = carPixels(await page.screenshot({ timeout: 5_000 }));
    expect(pixels).toBeGreaterThan(1000);
  }).toPass({ timeout });
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
      await expectVisibleCar(page);
      await expect(page.getByRole('button', { name: 'Rev engine', exact: true })).toHaveCount(0);
      const controls = page
        .getByRole('button', { name: 'All controls', exact: true })
        .filter({ visible: true });
      const controlsPosition = await controls.boundingBox();
      await expect(
        page.getByRole('button', { name: 'Reset camera view', exact: true }),
      ).toHaveCount(0);
      await page.mouse.move(8, 450);
      await page.mouse.down();
      await page.mouse.move(16, 490, { steps: 4 });
      await expect(page.locator('body')).toHaveClass(/orbiting/);
      await page.mouse.up();
      await expect(page.locator('body')).not.toHaveClass(/orbiting/);
      const reset = page
        .getByRole('button', { name: 'Reset camera view', exact: true })
        .filter({ visible: true });
      await expect(reset).toBeVisible();
      expect(await controls.boundingBox()).toEqual(controlsPosition);
      await reset.click();
      await expect(controls).toBeFocused();
      await expect(reset).toBeHidden();
      await controls.click();
      await page.getByRole('combobox', { name: 'Search portfolio controls' }).fill('share');
      await expect(page.getByRole('option', { name: /Share this garage/ })).toBeVisible();
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
      await accessible(page);

      const carTrigger = page
        .getByRole('button', { name: /Browse cars\./ })
        .filter({ visible: true });
      await carTrigger.click();
      await expect(page.getByRole('dialog', { name: 'Pick your ride.' })).toBeVisible();
      await expect
        .poll(() =>
          page
            .locator('.car-browser img')
            .evaluateAll(
              (images, count) =>
                images.length === count &&
                images.every((image) => (image as HTMLImageElement).naturalWidth > 0),
              GARAGE_INDICES.length,
            ),
        )
        .toBe(true);
      await accessible(page);
      await page.keyboard.press('Escape');
      await expect(carTrigger).toBeFocused();

      if (width === 390) {
        const paint = page
          .getByRole('button', { name: /^Paint: .+\. Change color$/ })
          .filter({ visible: true });
        await expect(paint).toHaveAccessibleName('Paint: Ferrari Red. Change color');
        await paint.click();
        await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
        await expect(paint).toHaveAccessibleName('Paint: Bordeaux. Change color');
        for (let i = 0; i < 6; i++) await paint.click();
        await expect(paint).toHaveAccessibleName('Paint: Ferrari Red. Change color');
      } else {
        await page
          .getByRole('button', { name: 'Paint: Bordeaux', exact: true })
          .filter({ visible: true })
          .click();
        await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('#702c43');
        const defaultPaint = page
          .getByRole('button', { name: 'Paint: Ferrari Red (default)', exact: true })
          .filter({ visible: true });
        await defaultPaint.click();
        await expect(defaultPaint).toHaveAttribute('aria-pressed', 'true');
      }
      await expect.poll(() => new URL(page.url()).searchParams.get('paint')).toBe('original');

      await page.keyboard.press('Control+k');
      await expect(page.getByRole('dialog', { name: 'Command menu' })).toBeVisible();
      const results = page.getByRole('listbox').getByRole('option');
      await results.first().hover();
      await page.getByRole('combobox', { name: 'Search portfolio controls' }).press('ArrowDown');
      await expect(results.nth(1)).toHaveAttribute('aria-selected', 'true');
      await expect
        .poll(() =>
          results.evaluateAll((options) =>
            options
              .filter((option) => {
                const background = getComputedStyle(option).backgroundColor;
                return background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent';
              })
              .map((option) => option.id),
          ),
        )
        .toEqual(['command-sec-experience']);
      for (const index of GARAGE_INDICES.slice(9)) {
        await expect(page.locator(`#command-car-${index}`)).toContainText('select');
      }
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

      await page.emulateMedia({ reducedMotion: 'no-preference' });
      const story = page.getByRole('button', {
        name: 'How I built it: everythingisfine',
        exact: true,
      });
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
      if (width === 390) {
        await page.setViewportSize({ width: 320, height: 900 });
        const heights = await viewer
          .locator('.preview-dialog-heading button')
          .evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
        expect(
          Math.max(...heights),
          'screenshot actions stay on one line on a narrow phone',
        ).toBeLessThanOrEqual(48);
        await page.setViewportSize({ width, height: 900 });
      }
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
      await page.emulateMedia({ reducedMotion: 'reduce' });

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
      await expect(page.locator('#desktop-dock')).toBeHidden();
      await expect(page.locator('#mobile-bar')).toBeHidden();
      await expect(page.getByRole('button', { name: 'All controls', exact: true })).toHaveCount(0);
      await expect(page.locator('.portfolio-scene')).toBeVisible();
      await page.mouse.move(8, 450);
      await page.mouse.down();
      await page.mouse.move(16, 490, { steps: 4 });
      await expect(page.locator('body')).not.toHaveClass(/orbiting/);
      await page.mouse.up();
      await expect(page.getByRole('link', { name: 'me@aidenjang.com', exact: true })).toBeVisible();
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
  await page.addInitScript(() => {
    const contexts = { webgl: 0, canvas2d: 0 };
    const seen = new WeakSet<HTMLCanvasElement>();
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      const context = Reflect.apply(original, this, [type, ...args]);
      if (context && !seen.has(this)) {
        seen.add(this);
        if (type === '2d') contexts.canvas2d++;
        else if (type === 'webgl2' || type === 'webgl') contexts.webgl++;
      }
      return context;
    } as typeof original;
    Object.assign(window, { portfolioGraphicsContexts: contexts });
  });
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
  await (await effectsDownloaded).finished();
  await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
  await expectVisibleCar(page);
  await page.evaluate(async () => {
    for (let frame = 0; frame < 6; frame++)
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });
  expect(
    await page.evaluate(
      () =>
        (window as Window & { portfolioGraphicsContexts?: { webgl: number; canvas2d: number } })
          .portfolioGraphicsContexts,
    ),
    'startup reuses the scene context and the pre-rendered glow',
  ).toEqual({ webgl: 1, canvas2d: 0 });
});

test('clean capture mode frames a visible car without page chrome', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?clean&car=0&paint=original');
  await expect(page.locator('canvas')).toBeVisible();
  await expect(page.locator('body')).toHaveAttribute('data-car-view', 'visible');
  await expect(page.getByRole('heading')).toHaveCount(0);
  await expectVisibleCar(page, 60_000);
});
