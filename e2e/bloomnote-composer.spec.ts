import { expect, test } from '@playwright/test';
for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
]) {
  test(`bloomnote grows a personal flower at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.route('**/*.glb', (route) => route.abort());
    await page.goto('/#project-bloomnote');
    const garden = page.locator('#project-bloomnote');
    const write = garden.getByRole('button', { name: 'Write a note' });
    const sentence = garden.getByRole('textbox', { name: 'A note for someone' });
    const note = garden.getByRole('blockquote');
    await write.click();
    await expect(sentence).toBeFocused();
    await sentence.fill('You brought soup and stayed until dusk.');
    await garden.getByRole('button', { name: 'Grow a flower' }).click();
    await expect(write).toBeFocused();
    await expect(note).toHaveText('“You brought soup and stayed until dusk.”');
    await garden.getByRole('button', { name: 'Anemone' }).press('Enter');
    await expect(note).toHaveText('“You notice the little things.”');
    await garden.getByRole('button', { name: 'Gerbera' }).press('Enter');
    await expect(note).toHaveText('“You brought soup and stayed until dusk.”');
  });
}
