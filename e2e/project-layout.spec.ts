import { test, expect } from '@playwright/test';

for (const width of [1440, 1024, 768, 390]) {
  test(`project previews stay aligned and proportioned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
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
    await page.goto('/#project-bloomnote');
    await expect(page.locator('#project-bloomnote .project-preview')).toBeAttached();
    await page.evaluate(() => document.fonts.ready);
    const cards = await page.locator('.project-gallery .garage-project').evaluateAll((items) =>
      items.map((item) => {
        const img = item.querySelector('.preview-thumbnail img')!;
        const box = img.getBoundingClientRect();
        return {
          name: item.id,
          top: item.getBoundingClientRect().top,
          links: item.querySelector('.garage-project-links')!.getBoundingClientRect().top,
          descriptionEnd: item.querySelector('.garage-project-copy > p')!.getBoundingClientRect()
            .bottom,
          image: box.top,
          height: box.height,
          expectedHeight: box.width / 2,
        };
      }),
    );
    for (const card of cards) {
      expect.soft(Math.abs(card.height - card.expectedHeight), card.name).toBeLessThan(2);
      if (width >= 768) {
        for (const peer of cards.filter(
          (other) => other.name !== card.name && Math.abs(other.top - card.top) < 1,
        )) {
          expect.soft(Math.abs(card.links - peer.links), `${card.name} links`).toBeLessThan(1);
          expect.soft(Math.abs(card.image - peer.image), `${card.name} image`).toBeLessThan(1);
        }
      } else {
        expect.soft(card.links - card.descriptionEnd, `${card.name} links gap`).toBeLessThan(36);
      }
    }
    await expect(page.locator('.project-featured-group article h3')).toHaveText([
      'everythingisfine',
      'iodine',
    ]);
    await expect(page.locator('.project-gallery article h3').first()).toHaveText('mrrp');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({
      path: test.info().outputPath(`project-layout-${width}.png`),
      animations: 'disabled',
    });
  });
}
