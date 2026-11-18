import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('**/_vercel/**', (route) => route.fulfill({ body: '' }));
  await page.route('**/*.glb', (route) => route.abort());
});

function scrollTo(page: Page, top: number) {
  return page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top);
}

test('the desktop underline tracks the section and fits after resize', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const header = page.locator('.portfolio-header');
  const nav = page.locator('#nav');
  const marker = nav.locator('.nav-motion-marker');
  const markerFollowsActive = () =>
    marker.evaluate((element) => {
      const selected = element.parentElement?.querySelector('a[aria-current="page"]');
      if (!selected) return false;
      const link = selected.getBoundingClientRect();
      const line = element.getBoundingClientRect();
      return Math.abs(link.left - line.left) < 1 && Math.abs(link.width - line.width) < 1;
    });

  await expect(marker).toBeVisible();
  await expect.poll(markerFollowsActive).toBe(true);
  await expect(header).toHaveCSS('background-color', /^rgba\(\d+, \d+, \d+, 0\)$/);
  await scrollTo(page, 44);
  await expect(header).toHaveCSS('background-color', 'rgba(16, 16, 20, 0.5)');

  await nav.getByRole('link', { name: 'Featured work', exact: true }).click();
  await expect(nav.locator('a[aria-current]')).toHaveText('Featured work');
  await expect.poll(markerFollowsActive).toBe(true);
  await expect(header).toHaveCSS('background-color', 'rgb(16, 16, 20)');

  await nav.getByRole('link', { name: 'Contact', exact: true }).click();
  await expect(page.getByRole('link', { name: /me@aidenjang.com/ })).toBeInViewport();
  await page.setViewportSize({ width: 1024, height: 900 });
  await expect(nav.locator('a[aria-current]')).toHaveText('Contact');
  await expect.poll(markerFollowsActive).toBe(true);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(marker).toHaveCSS('transition-duration', '0s');
  await nav.getByRole('link', { name: 'Intro', exact: true }).click();
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await expect(nav.locator('a[aria-current]')).toHaveText('Intro');
});

test.describe('mobile navigation motion', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: 'no-preference',
  });

  test('closing the menu restores focus and touch interrupts a section jump', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    const panel = page.locator('#mobile-navigation');
    await menu.press('Enter');
    await panel.getByRole('link', { name: 'Featured work', exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveJSProperty('inert', true);

    await menu.tap();
    const stoppedAt = await page.evaluate(async () => {
      document
        .querySelector<HTMLAnchorElement>('#mobile-navigation a[href="#sec-contact"]')!
        .click();
      for (let frame = 0; frame < 20 && scrollY < 80; frame++) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
      const position = scrollY;
      window.dispatchEvent(new Event('touchstart'));
      return position;
    });
    expect(stoppedAt).toBeGreaterThan(0);
    expect(stoppedAt).toBeLessThan(600);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.tap();
    const active = await page.evaluate(() => {
      const sections = [...document.querySelectorAll('main section[id^="sec-"]')];
      return sections.reduce(
        (id, section) =>
          section.getBoundingClientRect().top <= innerHeight * 0.15 ? section.id : id,
        'sec-intro',
      );
    });
    expect(Math.abs((await page.evaluate(() => scrollY)) - stoppedAt)).toBeLessThan(2);
    await expect(panel.locator('a[aria-current]')).toHaveAttribute('href', '#' + active);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(panel).toHaveCSS('transition-duration', '0s');
    await panel.getByRole('link', { name: 'Contact', exact: true }).tap();
    await expect(page.getByRole('link', { name: /me@aidenjang.com/ })).toBeInViewport();
  });
});
