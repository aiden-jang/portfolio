import { expect, test, type Locator } from '@playwright/test';

function observePulse(button: Locator) {
  return button.evaluate(
    (element) =>
      new Promise<boolean>((resolve) => {
        let dimmed = false;
        const finish = (complete: boolean) => {
          observer.disconnect();
          window.clearTimeout(timer);
          resolve(complete);
        };
        const observer = new MutationObserver(() => {
          if ((element as HTMLButtonElement).disabled) dimmed = true;
          else if (dimmed) finish(true);
        });
        const timer = window.setTimeout(() => finish(false), 20_000);
        observer.observe(element, { attributes: true, attributeFilter: ['disabled'] });
      }),
  );
}

for (const [index, name, action] of [
  [16, 'Ferrari F1-75', 'DRS rear wing'],
  [15, 'Red Bull RB16B', 'DRS rear wing'],
  [2, 'Toyota Supra', 'Flash headlights'],
] as const) {
  test(`${name} detail works on phone and desktop and clears on a car change`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.clock.setFixedTime(new Date('2026-10-13T18:00:00Z'));
    await page.route('**/_vercel/**', (route) =>
      route.fulfill({ body: '', contentType: 'application/javascript' }),
    );
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto(`/?car=${index}&light=night`);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    const button = () =>
      page.getByRole('button', { name: action, exact: true }).filter({ visible: true });
    for (const width of [320, 1440]) {
      if (width === 1440) await page.setViewportSize({ width, height: 900 });
      await expect(button()).toBeEnabled();
      const bounds = await button().evaluate((element) => {
        const rect = element.getBoundingClientRect();
        const rev = element.parentElement!.querySelector('[aria-label="Rev engine"]')!;
        return {
          x: rect.x,
          right: rect.right,
          width: rect.width,
          height: rect.height,
          sameRow: Math.abs(rev.getBoundingClientRect().y - rect.y) < 1,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.right).toBeLessThanOrEqual(width);
      expect(bounds.overflow).toBe(false);
      if (action === 'Flash headlights' && width === 320) expect(bounds.sameRow).toBe(true);
      const pulse = action === 'Flash headlights' ? observePulse(button()) : null;
      if (width === 320) await button().click();
      else await button().press('Space');
      if (action === 'DRS rear wing') {
        await expect(button()).toHaveAttribute('aria-pressed', width === 320 ? 'true' : 'false');
      } else {
        expect(await pulse, 'Flash disables briefly, then unlocks for another pulse').toBe(true);
        await expect(button()).toBeEnabled();
      }
    }
    await page.locator('h1').click();
    await page.keyboard.press('1');
    await expect(page.getByRole('button', { name: action, exact: true })).toHaveCount(0);
    await expect(page.locator('.car-choice-status').first()).toHaveText('', { timeout: 60_000 });
    expect(errors).toEqual([]);
  });
}
