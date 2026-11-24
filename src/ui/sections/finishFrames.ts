export const FINISH_MEDIA = '/showroom/finish-study/';
const frameWidth = 352;
const frameHeight = 760;
const columns = 4;
const framesPerSheet = 12;
const lastFrame = 32;

export function finishFrames(canvas: HTMLCanvasElement, progress: () => number) {
  const context = canvas.getContext('2d');
  let sheets: HTMLImageElement[] = [];
  let drawn = -1;

  function draw() {
    const frame = Math.round(progress() * lastFrame);
    const sheet = sheets[Math.floor(frame / framesPerSheet)];
    if (!context || !sheet?.complete || !sheet.naturalWidth || frame === drawn) return;
    const cell = frame % framesPerSheet;
    context.drawImage(
      sheet,
      (cell % columns) * frameWidth,
      Math.floor(cell / columns) * frameHeight,
      frameWidth,
      frameHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    drawn = frame;
    canvas.hidden = false;
  }

  return {
    draw,
    load() {
      if (!context || sheets.length) return;
      sheets = Array.from({ length: Math.ceil((lastFrame + 1) / framesPerSheet) }, (_, index) => {
        const image = new Image();
        image.onload = draw;
        image.src = `${FINISH_MEDIA}mobile-frames-${index}.webp`;
        return image;
      });
    },
    clear() {
      for (const sheet of sheets) sheet.onload = null;
      sheets = [];
      drawn = -1;
      canvas.hidden = true;
    },
  };
}
