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
    await page.route('**/*.glb', (route) => route.abort());
    await page.goto('/#project-wherever');
    const dinner = page.locator('#project-wherever');
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
    const receipt = dinner.getByText('$24 each', { exact: true });
    await expect(receipt).toBeVisible();
    await expect(receipt).toBeInViewport();
    const splitReceipt = await receipt.elementHandle();
    await expect(dinner).toHaveAttribute('data-moment', 'entry');
    await expect(receipt).toBeVisible();
    await expect(receipt).toBeInViewport();
    expect(await receipt.evaluate((node, original) => original === node, splitReceipt)).toBe(true);
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
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.hash === '#project-wherever');
  });
}
