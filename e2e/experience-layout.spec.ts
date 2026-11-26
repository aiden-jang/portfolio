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
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: async (value: string) => sessionStorage.setItem('copied-case', value) },
        configurable: true,
      });
    });
    await page.goto('/#sec-experience');
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('#sec-experience');
    const replayHeading = section.getByRole('heading', {
      name: '120 calls → 1',
      exact: true,
    });
    await expect(replayHeading).toBeVisible({ timeout: 3000 });
    await expect(section.getByRole('heading', { name: 'Experience', exact: true })).toBeVisible();
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
    const heading = await replayHeading.boundingBox();
    const header = await page.locator('.portfolio-header').boundingBox();
    expect(heading!.y, 'section heading clears the fixed header').toBeGreaterThanOrEqual(
      header!.y + header!.height,
    );
    if (width === 1440 || width < 768) {
      for (const selector of [
        '#sec-intro h1',
        '#project-everythingisfine .earthquake-title',
        '#project-iodine',
      ]) {
        const chapter = await page.locator(selector).boundingBox();
        expect(chapter!.x, selector + ' shares the Experience gutter').toBeCloseTo(heading!.x, 0);
      }
    }
    if (width < 768) {
      const title = await page.locator('.earthquake-title').boundingBox();
      const globe = await page.locator('#project-everythingisfine .orbit-feature').boundingBox();
      const detail = await page.locator('.earthquake-detail').boundingBox();
      expect(globe!.y).toBeGreaterThanOrEqual(title!.y + title!.height);
      expect(detail!.y).toBeGreaterThanOrEqual(globe!.y + globe!.height);
    }
    const lead = section.getByRole('link', { name: 'How I batched the requests', exact: true });
    await expect(lead).toBeVisible();
    const history = section.locator('.experience-history');
    await expect(history.getByText('LiveIntent', { exact: true })).toHaveCount(1);
    await expect(history).toContainText('Associate Software Engineer');
    await expect(
      section.getByText('weekly Sponsorships impressions', { exact: true }),
    ).toBeVisible();
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
          lead: box(el.querySelector('.experience-lead')!),
          proof: box(proof),
          outcomes: box(el.querySelector('.experience-proof-strip')!),
          rows: [...el.querySelectorAll('.experience-outcome')]
            .filter((e) => e.getClientRects().length)
            .map(box),
        };
      });
      const { history, lead, proof, outcomes, rows } = boxes;
      expect(outcomes.y).toBeGreaterThanOrEqual(lead.bottom - 1);
      expect(outcomes.bottom).toBeLessThanOrEqual(Math.min(history.y, proof.y) + 1);
      expect(lead.bottom).toBeLessThanOrEqual(Math.min(history.y, proof.y) + 1);
      if (width > 900) {
        expect(proof.x).toBeGreaterThanOrEqual(history.right - 1);
        expect(lead.x).toBeCloseTo(history.x, 0);
        expect(lead.right).toBeCloseTo(proof.right, 0);
      } else {
        expect(proof.y).toBeGreaterThanOrEqual(history.bottom - 1);
      }
      for (let i = 1; i < rows.length; i++) {
        const [previous, next] = [rows[i - 1], rows[i]];
        expect(next.y >= previous.bottom - 1 || next.x >= previous.right - 1).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    };
    await assertLayout();
    if (width === 1440 || width === 390) {
      const comparison = section.getByRole('figure', { name: 'Request batching comparison' });
      await expect(comparison).toHaveCSS('border-top-width', '0px');
      const result = comparison.getByText('1 request · 2s load time', { exact: true });
      await expect(result).toBeVisible();
      await expect(comparison.getByRole('button', { includeHidden: true })).toHaveCount(0);
      await lead.scrollIntoViewIfNeeded();
      const batchPosition = await page.evaluate(() => scrollY);
      await lead.click();
      await expect(page.getByRole('heading', { name: '120 API calls became one.' })).toBeFocused();
      await expect(page.locator('.batch-case-opening')).toContainText('1 batched request');
      await page.getByRole('button', { name: 'Copy evidence link' }).click();
      await expect(page.getByRole('button', { name: 'Link copied', exact: true })).toBeVisible();
      expect(await page.evaluate(() => sessionStorage.getItem('copied-case'))).toMatch(
        /\/cases\/request-batching\/$/,
      );
      await page.goBack();
      await expect(lead).toBeFocused();
      await expect(result).toBeVisible();
      await expect
        .poll(() => page.evaluate((position) => Math.abs(scrollY - position), batchPosition))
        .toBeLessThan(2);
      const trigger = section.getByRole('button', { name: /Replaced a live PHP backend/ });
      await trigger.evaluate((button) => {
        button.scrollIntoView({ block: 'center', behavior: 'instant' });
        button.focus({ preventScroll: true });
      });
      const readingPosition = await page.evaluate(() => scrollY);
      await page.keyboard.press('Enter');
      const reader = page.getByRole('dialog');
      await expect(
        reader.getByRole('heading', { name: 'Replacing a live publisher backend' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await expect
        .poll(() => page.evaluate((position) => Math.abs(scrollY - position), readingPosition))
        .toBeLessThan(2);
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
      if (id === 'sec-about') {
        await expect
          .poll(() => target.evaluate((el) => Math.abs(el.getBoundingClientRect().top)))
          .toBeLessThan(2);
      }
      const title = await (
          id === 'sec-more-work'
            ? target.locator('#bloom-garden-title')
            : target.getByRole('heading', { name: 'About', exact: true })
        ).boundingBox(),
        banner = await page.locator('.portfolio-header').boundingBox();
      expect(title!.y, id + ' clears the fixed header').toBeGreaterThanOrEqual(
        banner!.y + banner!.height,
      );
      if (id === 'sec-more-work') expect(title!.y - banner!.height).toBeLessThan(20);
      if (id === 'sec-about') {
        await expect(target.locator('h2')).toHaveText('About', { timeout: 3000 });
        const study = target.getByRole('figure', { name: 'Framing the showroom' });
        await expect(
          study.getByRole('slider', { name: 'Ferrari camera and finish' }),
        ).toBeVisible();
        await expect(study.locator('.finish-poster-paint img')).toHaveAttribute(
          'src',
          '/showroom/contact/desktop.webp',
        );
        const frame = await study.boundingBox();
        const reel = await target.locator('.about-reel').boundingBox();
        const lead = await target.locator('.about-lead').boundingBox();
        const details = await target.locator('.about-details').boundingBox();
        if (width >= 900) expect(lead!.x).toBeGreaterThan(reel!.x + reel!.width);
        else if (width >= 768) expect(lead!.y).toBeGreaterThan(reel!.y + reel!.height);
        else expect(reel!.y).toBeGreaterThan(lead!.y + lead!.height);
        expect(frame!.y).toBeGreaterThan(details!.y + details!.height);
        expect(details!.y).toBeGreaterThan(lead!.y + lead!.height);
        await expect(target.locator('.about-lead')).toContainText('recovering an edit');
        await expect(
          target.getByText('Computer Engineering at Rutgers', { exact: true }),
        ).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
  });
}

test('a blocked clipboard leaves the case link and reading controls clear', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 660 });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: async () => {
          throw new DOMException('Denied', 'NotAllowedError');
        },
      },
    });
  });
  await page.goto('/?car=0&paint=original&light=studio#work/ad-slot-details-120-1-api-call');
  const reader = page.getByRole('dialog');
  const copy = reader.getByRole('button', { name: 'Copy case link' });
  await copy.click();
  const url = reader.getByRole('textbox', { name: 'Case study link' });
  await expect(url).toHaveValue(/\/#work\/ad-slot-details-120-1-api-call$/);
  await expect(reader.getByRole('button', { name: 'Continue reading', exact: false })).toBeHidden();
  await expect(reader.getByRole('button', { name: 'Next case study' })).toBeVisible();
  await expect(url).toBeInViewport();
  await reader.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(url).toBeHidden();
  await expect(copy).toBeFocused();
});
