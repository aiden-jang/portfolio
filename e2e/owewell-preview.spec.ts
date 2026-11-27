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
    await page.goto('/work/');
    await page.getByRole('link', { name: 'owewell Split the bill' }).click();
    const dinner = page.locator('#project-wherever');
    await expect(dinner).toHaveAttribute('data-moment', 'bill');
    const photo = await dinner.getByRole('img', { name: /Pepperoni pizza/ }).elementHandle();
    await expect(dinner.getByRole('link', { name: 'Open app: owewell' })).toHaveAttribute(
      'href',
      'https://owewell.aidenjang.com',
    );
    await dinner.getByRole('button', { name: 'Split $48', exact: true }).click();
    await expect(dinner.getByText('$24.00', { exact: true })).toHaveCount(2);
    await page.evaluate(() => {
      location.hash = 'project-worth';
    });
    await expect(dinner).toHaveAttribute('data-moment', 'entry');
    await dinner.getByRole('button', { name: 'Favorite', exact: true }).click();
    await expect(dinner.locator('.meal-character')).toBeInViewport();
    expect(
      await photo?.evaluate((node) => node === document.querySelector('.meal-photo img')),
    ).toBe(true);
    await page.evaluate(() => {
      location.hash = 'project-wherever';
    });
    await expect(dinner).toHaveAttribute('data-moment', 'vote');
    await dinner.getByRole('button', { name: /Pick Neighborhood/ }).press('Enter');
    await expect(dinner).toHaveAttribute('data-moment', 'picked');
  });
}
