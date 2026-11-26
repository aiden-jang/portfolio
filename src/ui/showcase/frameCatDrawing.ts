export function frameCatDrawing(board: HTMLCanvasElement) {
  const { width, height } = board;
  const pixels = board.getContext('2d')!.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = 0;
  let bottom = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] < 4) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  const paper = document.createElement('canvas');
  paper.width = 720;
  paper.height = 432;
  paper.toggleAttribute('data-personalized', board.hasAttribute('data-marked'));
  if (left > right) return paper;
  const inkWidth = right - left + 1;
  const inkHeight = bottom - top + 1;
  const scale = Math.min(640 / inkWidth, 366 / inkHeight);
  const printWidth = inkWidth * scale;
  const printHeight = inkHeight * scale;
  paper
    .getContext('2d')!
    .drawImage(
      board,
      left,
      top,
      inkWidth,
      inkHeight,
      (paper.width - printWidth) / 2,
      (paper.height - printHeight) / 2,
      printWidth,
      printHeight,
    );
  return paper;
}
