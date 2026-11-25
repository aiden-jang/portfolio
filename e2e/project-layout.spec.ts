import { test, expect } from '@playwright/test';

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`project previews stay aligned and proportioned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : width === 390 ? 730 : 1000 });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type === 'webgl' || type === 'webgl2') return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    if (width === 320) {
      await page.route('**/projects/worth-verdict.webp', (route) => route.fulfill({ status: 404 }));
      await page.route('**/projects/worth.jpg', (route) => route.fulfill({ status: 404 }));
    }
    await page.goto('/#sec-more-work');
    await page.evaluate(() => document.fonts.ready);
    const gallery = page.locator('.project-gallery');
    await expect(page.locator('#bloom-garden-title, #sec-more-work h3')).toHaveText([
      'bloomnote',
      'iguess',
      'mrrp',
      /^wherever.*owewell.*$/,
      'worth',
      'platform',
    ]);
    const worth = gallery.locator('#project-worth');
    if (width === 320) {
      await worth.scrollIntoViewIfNeeded();
      await expect(worth.getByRole('status')).toContainText('Screenshot unavailable');
      await expect(worth.getByRole('button', { name: 'Inspect screenshot: worth' })).toBeDisabled();
      await expect(worth.locator('.garage-project-links a')).toHaveAttribute('target', '_blank');
    } else {
      await expect(worth.getByText('Brooklyn Kura Sake Junmai', { exact: true })).toBeVisible();
      const favorite = worth.getByText('Goose Island IPA', { exact: true });
      await expect(favorite).toBeVisible();
      await expect(favorite).toHaveCSS('grid-row-start', '1');
    }
    const bloom = page.locator('#project-bloomnote');
    await expect(bloom.getByRole('blockquote')).toContainText('For that brilliant laugh');
    const galleryTitle = await page
      .getByRole('heading', { name: 'More projects', exact: true })
      .boundingBox();
    const gardenTitle = await bloom.getByRole('heading', { name: 'bloomnote' }).boundingBox();
    const aboutTitle = await page.locator('#sec-about h2').boundingBox();
    const garden = await bloom.boundingBox();
    expect(galleryTitle!.y).toBeGreaterThan(garden!.y + garden!.height);
    expect(galleryTitle!.x).toBeCloseTo(gardenTitle!.x, 0);
    expect(galleryTitle!.x).toBeCloseTo(aboutTitle!.x, 0);
    if (width < 768) {
      const profile = await page.locator('.about-profile').boundingBox();
      const framing = await page.locator('.about-framing-study').boundingBox();
      expect(framing!.y).toBeGreaterThan(profile!.y + profile!.height);
    }
    const spread = await bloom.evaluate((item) => ({
      card: item.getBoundingClientRect().toJSON(),
      viewport: document.documentElement.clientWidth,
      garden: item.querySelector('.bloom-garden-plot')!.getBoundingClientRect().toJSON(),
      detail: item.querySelector('.bloom-garden-letter')!.getBoundingClientRect().toJSON(),
    }));
    expect.soft(spread.card.left, 'garden starts at the viewport edge').toBeCloseTo(0);
    expect.soft(spread.card.width, 'garden spans the viewport').toBeCloseTo(spread.viewport);
    if (width >= 768) {
      expect
        .soft(spread.detail.right, 'letter sits beside the flowers')
        .toBeLessThan(spread.garden.left);
    } else {
      expect
        .soft(spread.detail.top, 'letter sits below the flowers')
        .toBeGreaterThan(spread.garden.bottom);
    }
    const cards = await gallery.locator('.garage-project-compact').evaluateAll((items) =>
      items.map((item) => ({
        name: item.id,
        frame: item
          .querySelector('.preview-thumbnail, .worth-focus, .project-pair, .platform-viewport')!
          .getBoundingClientRect()
          .toJSON(),
        copy: item.querySelector('.garage-project-copy')!.getBoundingClientRect().toJSON(),
        title: item.querySelector('h3 button')!.getBoundingClientRect().toJSON(),
        app: item.querySelector('.garage-project-links a')!.getBoundingClientRect().toJSON(),
      })),
    );
    for (const { name, frame, copy, title, app } of cards) {
      expect.soft(frame.height, name + ' has a readable image').toBeGreaterThanOrEqual(105);
      expect.soft(frame.width, name + ' media fits the viewport').toBeLessThanOrEqual(width);
      expect.soft(app.left, name + ' action clears its title').toBeGreaterThanOrEqual(title.right);
      expect
        .soft(copy.top - frame.bottom, name + ' copy follows the media')
        .toBeGreaterThanOrEqual(0);
      expect.soft(copy.top - frame.bottom, name + ' media-to-copy gap').toBeLessThan(36);
    }
    if (width >= 768) {
      expect.soft(cards[0]!.frame.top).toBeCloseTo(cards[1]!.frame.top, 0);
      expect.soft(cards[1]!.frame.left).toBeGreaterThan(cards[0]!.frame.right);
    } else {
      expect.soft(cards[0]!.frame.width).toBeCloseTo(cards[1]!.frame.width, 0);
      expect.soft(cards[0]!.frame.left).toBeCloseTo(cards[1]!.frame.left, 0);
      expect.soft(cards[1]!.frame.top).toBeGreaterThan(cards[0]!.frame.bottom);
    }
    const scenes = await page
      .locator('.project-scenes > article')
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
    for (let index = 1; index < scenes.length; index++) {
      expect(scenes[index]!.top).toBeGreaterThan(scenes[index - 1]!.bottom);
      expect(scenes[index]!.width).toBe(scenes[0]!.width);
    }
    await expect(page.locator('.work-exhibit article h3')).toHaveText(['meanwhile.', 'iodine']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`project-layout-${width}.png`),
      animations: 'disabled',
    });
  });
}
