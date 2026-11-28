import { expect, test } from '@playwright/test';
for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test(`the dinner story keeps the pizza through the split and Favorite at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.route('**/*.glb', (route) => route.abort());
    const dinner = page.locator('#project-wherever');
    await page.goto('/#project-mrrp');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.studio-route')).toHaveAttribute('data-mode', 'room');
    const bean = page.getByRole('button', { name: 'Pet Bean' });
    await expect(bean).toBeInViewport();
    await bean.click();
    await expect(page.getByText('Bean leans into your hand. Mrrp!')).toBeVisible();
    const seek = (progress: number) =>
      dinner.evaluate((article, progress) => {
        const entrance = article.querySelector<HTMLElement>('.supper-entrance')!;
        const stage = article.querySelector<HTMLElement>('.meal-stage')!;
        const inset = parseFloat(getComputedStyle(stage).top) || 0;
        scrollBy({
          top: article.getBoundingClientRect().top - inset + entrance.offsetHeight * progress,
          behavior: 'instant',
        });
      }, progress);
    await seek(0.5);
    await expect(dinner).toHaveAttribute('data-cut', 'opening');
    await expect(dinner.locator('.meal-stage')).toHaveJSProperty('inert', true);
    await seek(-0.2);
    await expect(dinner).toHaveAttribute('data-cut', 'waiting');

    await page.goto('/#project-wherever');
    await expect(dinner.getByRole('img', { name: /Pepperoni pizza/ })).toBeInViewport();
    const total = dinner.getByText('$48.00', { exact: true });
    const initialTotal = await total.elementHandle();
    await expect(dinner).toHaveAttribute('data-moment', 'vote');
    expect(
      await dinner.evaluate((scene) => {
        const room = document.querySelector('#project-mrrp');
        const f40 = document.querySelector('#f40-study');
        return (
          !!room &&
          !!f40 &&
          Boolean(room.compareDocumentPosition(scene) & Node.DOCUMENT_POSITION_FOLLOWING) &&
          Boolean(scene.compareDocumentPosition(f40) & Node.DOCUMENT_POSITION_FOLLOWING)
        );
      }),
    ).toBe(true);
    await dinner.getByRole('button', { name: /Pick Neighborhood/ }).press('Enter');
    await expect(dinner).toHaveAttribute('data-moment', 'bill');
    await expect(dinner.getByRole('button', { name: 'Split $48', exact: true })).toBeFocused();
    const photo = await dinner.getByRole('img', { name: /Pepperoni pizza/ }).elementHandle();
    await expect(dinner.getByRole('link', { name: 'Open app: owewell' })).toHaveAttribute(
      'href',
      'https://owewell.aidenjang.com',
    );
    await dinner.getByRole('button', { name: 'Split $48', exact: true }).click();
    await expect(dinner.getByText('$24.00', { exact: true })).toHaveCount(2);
    await expect(dinner).toHaveAttribute('data-moment', 'entry');
    const receipt = dinner.getByText('$24 each', { exact: true });
    await expect(receipt).toBeVisible();
    await expect(receipt).toBeInViewport();
    expect(await total.evaluate((node, original) => node === original, initialTotal)).toBe(true);
    await expect(dinner.locator('.meal-character')).toBeInViewport();
    await dinner.getByRole('button', { name: 'Favorite', exact: true }).click();
    await expect(dinner.getByRole('button', { name: 'Favorite', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      await photo?.evaluate((node) => node === document.querySelector('.meal-photo img')),
    ).toBe(true);
    await dinner.evaluate((scene) => scene.scrollIntoView({ block: 'start', behavior: 'instant' }));
    await expect(dinner).toHaveAttribute('data-moment', 'vote');
    await page.evaluate(() => document.getElementById('project-worth')?.scrollIntoView());
    await expect(dinner).toHaveAttribute('data-phase', 'worth');
    await expect(dinner.getByRole('button', { name: 'Favorite', exact: true })).toBeInViewport();
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.hash === '#project-wherever');
  });
}
