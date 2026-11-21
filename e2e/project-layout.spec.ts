import { test, expect } from '@playwright/test';

for (const width of [1440, 1024, 768, 390, 320]) {
  test(`project previews stay aligned and proportioned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
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
    await expect(gallery.locator('h3')).toHaveText([
      'bloomnote',
      'mrrp',
      'worth',
      'wherever',
      'owewell',
      'iguess',
      'platform',
    ]);
    if (width === 320) {
      const worth = gallery.locator('#project-worth');
      await expect(worth.getByRole('status')).toContainText('Screenshot unavailable');
      await expect(worth.getByRole('button', { name: 'Inspect screenshot: worth' })).toBeDisabled();
      await expect(worth.locator('.garage-project-links a')).toHaveAttribute('target', '_blank');
    }
    const bloom = gallery.locator('#project-bloomnote');
    await expect(bloom.getByRole('blockquote')).toContainText('For that brilliant laugh');
    const spread = await bloom.evaluate((item) => ({
      card: item.getBoundingClientRect().toJSON(),
      gallery: item.parentElement!.getBoundingClientRect().toJSON(),
      garden: item.querySelector('.bloom-spread-garden')!.getBoundingClientRect().toJSON(),
      detail: item.querySelector('figcaption')!.getBoundingClientRect().toJSON(),
    }));
    expect.soft(spread.card.width, 'bloomnote spans the gallery').toBeCloseTo(spread.gallery.width);
    if (width > 860) {
      expect
        .soft(spread.detail.left, 'flower alongside the garden')
        .toBeCloseTo(spread.garden.right);
    } else {
      expect.soft(spread.detail.top, 'flower below the garden').toBeCloseTo(spread.garden.bottom);
    }
    const cards = await gallery.locator('.garage-project-compact').evaluateAll((items) =>
      items.map((item) => ({
        name: item.id,
        frame: item
          .querySelector(
            '.preview-thumbnail, .owewell-demo, .worth-focus, .iguess-replay, .project-pair',
          )!
          .getBoundingClientRect()
          .toJSON(),
        title: item.querySelector('h3 button')!.getBoundingClientRect().toJSON(),
        app: item.querySelector('.garage-project-links a')!.getBoundingClientRect().toJSON(),
        description: item
          .querySelector('.garage-project-copy > p')!
          .getBoundingClientRect()
          .toJSON(),
      })),
    );
    for (const { name, frame, title, app, description } of cards) {
      expect.soft(frame.height, name + ' has a readable image').toBeGreaterThanOrEqual(105);
      expect.soft(frame.width, name + ' media fits the viewport').toBeLessThanOrEqual(width);
      expect.soft(app.left, `${name} action clears the title`).toBeGreaterThanOrEqual(title.right);
      expect
        .soft(description.top, `${name} description follows actions`)
        .toBeGreaterThanOrEqual(app.bottom - 1);
      expect.soft(title.top - frame.bottom, `${name} image-to-title gap`).toBeLessThan(34);
      expect
        .soft(title.top, `${name} image precedes title`)
        .toBeGreaterThanOrEqual(frame.bottom - 1);
    }
    if (width >= 768) {
      const frame = (name: string) => cards.find((card) => card.name === 'project-' + name)!.frame;
      expect.soft(frame('mrrp').width).toBeCloseTo(frame('worth').width, 0);
      expect.soft(frame('mrrp').width).toBeLessThan(frame('wherever').width);
      expect
        .soft(frame('wherever').top, 'voting and settlement share a row')
        .toBeCloseTo(frame('owewell').top, 0);
      expect
        .soft(frame('iguess').top, 'the last two projects share a row')
        .toBeCloseTo(frame('platform').top, 0);
    }
    await expect(page.locator('.project-featured-group article h3')).toHaveText([
      'meanwhile.',
      'iodine',
    ]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`project-layout-${width}.png`),
      animations: 'disabled',
    });
  });
}
