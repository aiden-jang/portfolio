import { expect, test } from '@playwright/test';
for (const width of [2560, 1440, 1024, 768, 390, 320]) {
  test(`experience history and outcomes do not overlap at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: width === 320 ? 568 : 1000 });
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
    await expect(section.locator('h2')).toHaveText('Experience', { timeout: 3000 });
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
    const lead = section.getByRole('button', { name: 'Read the case study', exact: true });
    await expect(lead).toBeInViewport({ ratio: 1 });
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
      if (width > 900) expect(history.x).toBeGreaterThanOrEqual(proof.right - 1);
      else expect(history.y).toBeGreaterThanOrEqual(proof.bottom - 1);
      for (let i = 1; i < rows.length; i++)
        expect(rows[i].y).toBeGreaterThanOrEqual(rows[i - 1].bottom - 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    };
    await assertLayout();
    if (width === 1440 || width === 390) {
      for (const [trigger, title] of [
        [lead, 'Ad Slot Details: 120 → 1 API call'],
        [
          section.getByRole('button', { name: /Replaced a live PHP backend/ }),
          'Replacing a live publisher backend',
        ],
      ] as const) {
        await trigger.evaluate((button) => {
          button.scrollIntoView({ block: 'center', behavior: 'instant' });
          button.focus({ preventScroll: true });
        });
        const readingPosition = await page.evaluate(() => scrollY);
        await page.keyboard.press('Enter');
        await expect(page.getByRole('dialog').getByRole('heading', { name: title })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trigger).toBeFocused();
        await expect
          .poll(() => page.evaluate((position) => Math.abs(scrollY - position), readingPosition))
          .toBeLessThan(2);
      }
    }
    await section.locator('.experience-more summary').click();
    await assertLayout();
    await section.screenshot({
      path: test.info().outputPath(`experience-${width}.png`),
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
