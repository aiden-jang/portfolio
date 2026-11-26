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
      await page.route('**/projects/scenes/wherever-pizza.jpg', (route) =>
        route.fulfill({ status: 404 }),
      );
      await page.route('**/projects/worth-verdict.webp', (route) => route.fulfill({ status: 404 }));
      await page.route('**/projects/worth.jpg', (route) => route.fulfill({ status: 404 }));
    }
    await page.goto('/#sec-more-work');
    await page.evaluate(() => document.fonts.ready);
    const gallery = page.locator('.project-gallery');
    await expect(page.locator('#sec-more-work h3')).toHaveText([
      'iguess',
      'mrrp',
      /Neighborhood\s*Pizza Kitchen/,
      'platform',
    ]);
    const dinner = page.locator('.dinner-table');
    await dinner.scrollIntoViewIfNeeded();
    if (width === 320) {
      await expect(dinner.getByRole('status')).toHaveText('Pizza photo unavailable');
    } else {
      await expect(dinner.getByAltText('The pizza Alex and Maya chose')).toBeVisible();
    }
    await expect(dinner.getByRole('link', { name: 'Open app: worth' })).toHaveAttribute(
      'target',
      '_blank',
    );
    await expect(dinner.getByRole('button', { name: 'How I built it: worth' })).toHaveText(
      'Favorite.',
    );
    const character = await dinner.locator('.dinner-rating-character').boundingBox();
    const card = await dinner.locator('.table-slip').boundingBox();
    expect(character!.y).toBeGreaterThan(card!.y);
    expect(character!.y + character!.height).toBeLessThan(card!.y + card!.height);
    const bloom = page.locator('#project-bloomnote');
    await expect(bloom.getByRole('blockquote')).toContainText('For that brilliant laugh');
    await expect(page.getByRole('heading', { name: 'More projects', exact: true })).toHaveCount(1);
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
          .querySelector(
            '.preview-thumbnail, .dinner-rating, .worth-focus, .project-pair, .platform-viewport',
          )!
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
    expect(cards.map((card) => card.name)).toEqual(['project-platform']);
    const scenes = await page
      .locator('.project-scenes > article')
      .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().toJSON()));
    for (let index = 1; index < scenes.length; index++) {
      expect(scenes[index]!.top).toBeGreaterThanOrEqual(scenes[index - 1]!.bottom - 1);
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
