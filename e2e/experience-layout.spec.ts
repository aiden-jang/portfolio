import { expect, test } from '@playwright/test';
for (const width of [2560, 1440, 1024, 768, 390, 320]) {
  test(`experience history and outcomes do not overlap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (/webgl/.test(type)) return null;
        return Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
    await page.goto('/#sec-experience');
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#sec-experience');
    await section.getByRole('heading', { name: "Where I've worked" }).waitFor();
    const nav = page.locator('#nav');
    if (width >= 768) {
      await expect(nav.locator('a[data-section]')).toHaveText([
        'Intro',
        'Featured work',
        'Experience',
        'More projects',
        'About',
        'Contact',
      ]);
      await expect(nav.locator('a[aria-current]')).toHaveText('Experience');
    }
    await expect
      .poll(() => section.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
      .toBeLessThan(2);
    const heading = await section.locator('h2').boundingBox();
    const header = await page.locator('.portfolio-header').boundingBox();
    expect(heading!.y, 'section heading clears the fixed header').toBeGreaterThanOrEqual(
      header!.y + header!.height,
    );
    const assertLayout = async () => {
      const boxes = await section.evaluate((el) => {
        const box = (node: Element) => {
          const r = node.getBoundingClientRect();
          return {
            x: r.x,
            y: r.y,
            right: r.right,
            bottom: r.bottom,
            width: r.width,
            height: r.height,
          };
        };
        const history = el.querySelector('.experience-history')!,
          proof = el.querySelector('.experience-proof')!;
        return {
          history: box(history),
          proof: box(proof),
          rows: [...el.querySelectorAll('.experience-outcome')]
            .filter((e) => e.getClientRects().length)
            .map(box),
        };
      });
      const { history, proof, rows } = boxes;
      expect(
        history.right <= proof.x + 1 || history.bottom <= proof.y + 1,
        'career history clears the outcome list',
      ).toBe(true);
      for (let i = 1; i < rows.length; i++)
        expect(rows[i].y).toBeGreaterThanOrEqual(rows[i - 1].bottom - 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    };
    await assertLayout();
    await section.locator('.experience-more summary').click();
    await assertLayout();
    await page.screenshot({
      path: test.info().outputPath(`experience-${width}.png`),
      fullPage: true,
    });
    for (const id of ['sec-more-work', 'sec-about']) {
      await page.goto('/#' + id);
      await page.evaluate(() => document.fonts.ready);
      const target = page.locator('#' + id);
      if (width >= 768)
        await expect(nav.locator('a[aria-current]')).toHaveAttribute('href', '#' + id);
      await expect
        .poll(() => target.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
        .toBeLessThan(2);
      const title = await target.locator('h2').boundingBox(),
        banner = await page.locator('.portfolio-header').boundingBox();
      expect(title!.y, id + ' clears the fixed header').toBeGreaterThanOrEqual(
        banner!.y + banner!.height,
      );
    }
  });
}
