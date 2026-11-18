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
      await page.route('**/projects/worth.jpg', (route) => route.fulfill({ status: 404 }));
    }
    await page.goto('/#sec-more-work');
    await page.evaluate(() => document.fonts.ready);
    const gallery = page.locator('.project-gallery');
    await expect(gallery.locator('h3')).toHaveText([
      'mrrp',
      'worth',
      'bloomnote',
      'owewell',
      'iguess',
      'wherever',
      'platform',
    ]);
    if (width === 320) {
      const worth = gallery.locator('#project-worth');
      await expect(worth.getByRole('status')).toContainText('Screenshot unavailable');
      await expect(worth.getByRole('button', { name: 'Inspect screenshot: worth' })).toBeDisabled();
      await expect(worth.locator('.garage-project-links a')).toHaveAttribute('target', '_blank');
    }
    const cards = await gallery.locator('.garage-project').evaluateAll((items) =>
      items.map((item) => ({
        name: item.id,
        frame: item.querySelector('.preview-thumbnail')!.getBoundingClientRect().toJSON(),
        title: item.querySelector('h3 button')!.getBoundingClientRect().toJSON(),
        app: item.querySelector('.garage-project-links a')!.getBoundingClientRect().toJSON(),
        description: item
          .querySelector('.garage-project-copy > p')!
          .getBoundingClientRect()
          .toJSON(),
      })),
    );
    for (const { name, frame, title, app, description } of cards) {
      expect.soft(Math.abs(frame.height - frame.width / 2), name).toBeLessThan(1);
      expect.soft(Math.abs(frame.width - cards[0].frame.width), name).toBeLessThan(1);
      expect.soft(Math.abs(title.top - app.top), `${name} actions share a row`).toBeLessThan(1);
      expect.soft(app.left, `${name} action clears the title`).toBeGreaterThanOrEqual(title.right);
      expect
        .soft(description.top, `${name} description follows actions`)
        .toBeGreaterThanOrEqual(app.bottom - 1);
      if (width >= 768 && name === 'project-platform') {
        expect.soft(title.left, 'platform copy clears its image').toBeGreaterThan(frame.right);
      } else {
        expect.soft(title.top - frame.bottom, `${name} image-to-title gap`).toBeLessThan(16);
        expect
          .soft(title.top, `${name} image precedes title`)
          .toBeGreaterThanOrEqual(frame.bottom - 1);
      }
    }
    await expect(page.locator('.project-featured-group article h3')).toHaveText([
      'everythingisfine',
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
