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
    const lead = section.getByRole('link', { name: 'How I batched the requests', exact: true });
    await expect(lead).toBeVisible();
    await lead.click();
    await expect(page).toHaveURL(/request-batching/);
    await page.goBack();
    await expect(lead).toBeFocused();
    await page.getByRole('link', { name: 'Work index' }).click();
    const experience = page.locator('#experience');
    await expect(experience.getByRole('heading', { name: 'Experience' })).toBeVisible();
    await expect(
      experience.locator('.experience-history').getByText('LiveIntent', { exact: true }),
    ).toHaveCount(1);
    await expect(experience.locator('.experience-history')).toContainText(
      'Associate Software Engineer',
    );
    await expect(
      experience.getByText('weekly Sponsorships impressions', { exact: true }),
    ).toBeVisible();
    const layout = await experience.evaluate((element) => {
      const rows = [...element.querySelectorAll('.experience-outcome')].filter(
        (row) => row.getClientRects().length,
      );
      return rows.map((row) => {
        const box = row.getBoundingClientRect();
        return {
          withinViewport: box.left >= 0 && box.right <= innerWidth + 1,
          withoutOverflow: row.scrollWidth <= row.clientWidth + 1,
        };
      });
    });
    expect(layout.length).toBeGreaterThan(0);
    expect(layout.every((row) => row.withinViewport && row.withoutOverflow)).toBe(true);
  });
}
