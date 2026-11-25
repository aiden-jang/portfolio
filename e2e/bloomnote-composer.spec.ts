import { expect, test } from '@playwright/test';

for (const [width, height] of [
  [1440, 900],
  [390, 844],
  [375, 667],
] as const) {
  test(`bloomnote grows a local note and preserves the received garden at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.route('**/*.glb', (route) => route.abort());
    await page.goto('/#sec-more-work');
    const bloom = page.locator('#project-bloomnote');
    const write = bloom.getByRole('button', { name: 'Write a note' });
    await write.click();
    await expect(bloom.getByRole('heading', { name: 'Write a bloomnote' })).toBeFocused();

    const sentence = bloom.getByRole('textbox', { name: 'One sentence for someone' });
    const grow = bloom.getByRole('button', { name: 'Grow three flowers' });
    const note = bloom
      .getByRole('region', { name: 'Your three-flower garden' })
      .getByRole('blockquote');
    const gerbera = bloom.getByRole('button', { name: 'Gerbera', exact: true });
    await expect(gerbera).toBeDisabled();
    await bloom.getByRole('button', { name: 'Sunday coffee' }).click();
    await expect(sentence).toHaveValue(/favorite record/);
    await expect(note).toHaveText('You made the coffee before there was anything else to do.');
    await gerbera.press('Enter');
    await expect(bloom.locator('mark[data-active="true"]')).toHaveText(
      'put on our favorite record',
    );
    await expect(note).toHaveText('Our favorite record made the room feel like ours.');

    const edit = bloom.getByRole('button', { name: 'Edit sentence' });
    await edit.click();
    await expect(sentence).toBeFocused();
    await sentence.fill('You brought soup, told a story, and stayed until dusk.');
    await grow.click();
    for (const [flower, text] of [
      ['Anemone', '“You brought soup”'],
      ['Gerbera', '“told a story”'],
      ['Ranunculus', '“stayed until dusk”'],
    ]) {
      await bloom.getByRole('button', { name: flower, exact: true }).press('Enter');
      await expect(note).toHaveText(text!);
    }
    await bloom.getByRole('button', { name: 'Back to the received garden' }).click();
    await expect(write).toBeFocused();
    await expect(bloom.getByRole('blockquote')).toContainText('For that brilliant laugh');
    await write.click();
    await expect(sentence).toHaveValue('You brought soup, told a story, and stayed until dusk.');
    await expect(note).toHaveText('“stayed until dusk”');
  });
}
