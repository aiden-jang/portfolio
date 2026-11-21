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
    await expect(page.locator('#sec-more-work h3')).toHaveText([
      'bloomnote',
      'iguess',
      'wherever',
      'mrrp',
      'worth',
      'owewell',
      'platform',
    ]);
    if (width === 320) {
      const worth = gallery.locator('#project-worth');
      await expect(worth.getByRole('status')).toContainText('Screenshot unavailable');
      await expect(worth.getByRole('button', { name: 'Inspect screenshot: worth' })).toBeDisabled();
      await expect(worth.locator('.garage-project-links a')).toHaveAttribute('target', '_blank');
    }
    const bloom = page.locator('#project-bloomnote');
    await expect(bloom.getByRole('blockquote')).toContainText('For that brilliant laugh');
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
      if (name === 'project-iguess') {
        expect
          .soft(frame.top, 'the replay follows its introduction')
          .toBeGreaterThan(description.bottom);
      } else {
        expect.soft(title.top - frame.bottom, `${name} image-to-title gap`).toBeLessThan(34);
        expect
          .soft(title.top, `${name} image precedes title`)
          .toBeGreaterThanOrEqual(frame.bottom - 1);
      }
    }
    const frame = (name: string) => cards.find((card) => card.name === 'project-' + name)!.frame;
    expect.soft(frame('iguess').width).toBeGreaterThanOrEqual(frame('wherever').width);
    expect.soft(frame('iguess').bottom).toBeLessThan(frame('wherever').top);
    if (width >= 740) {
      expect.soft(frame('mrrp').width).toBeCloseTo(frame('worth').width, 0);
      expect
        .soft(frame('mrrp').top, 'supporting previews align')
        .toBeCloseTo(frame('worth').top, 0);
      expect.soft(frame('owewell').top).toBeCloseTo(frame('platform').top, 0);
    }
    if (width >= 1050) {
      expect.soft(frame('wherever').top).toBeCloseTo(frame('mrrp').top, 0);
      expect.soft(frame('wherever').width).toBeGreaterThan(frame('mrrp').width * 2);
    } else {
      expect.soft(frame('wherever').bottom).toBeLessThan(frame('mrrp').top);
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
