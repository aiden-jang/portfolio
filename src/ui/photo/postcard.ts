function fitText(context: CanvasRenderingContext2D, text: string, width: number) {
  if (context.measureText(text).width <= width) return text;
  let result = text;
  while (result.length && context.measureText(result + '…').width > width)
    result = result.slice(0, -1);
  return result + '…';
}
export async function makePostcard(
  blob: Blob,
  car: string,
  finish: string,
  credit?: string,
): Promise<File> {
  const image = new Image(),
    url = URL.createObjectURL(blob);
  try {
    image.src = url;
    await image.decode();
    await document.fonts.ready;
    const scale = Math.min(1, 1920 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.naturalWidth * scale);
    const density = credit ? canvas.width / 560 : canvas.width / Math.max(1, window.innerWidth);
    const imageHeight = Math.round(image.naturalHeight * scale);
    canvas.height = imageHeight + Math.round(112 * density);
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image export is unavailable.');
    context.fillStyle = '#101014';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, imageHeight);
    context.fillStyle = '#ededed';
    context.font = `500 ${24 * density}px Geist, sans-serif`;
    context.fillText(
      fitText(context, car, canvas.width - 48 * density),
      24 * density,
      imageHeight + 38 * density,
    );
    context.fillStyle = '#bcbcc5';
    context.font = `${14 * density}px Geist, sans-serif`;
    context.fillText(
      fitText(context, finish, canvas.width - 48 * density),
      24 * density,
      imageHeight + 64 * density,
    );
    context.font = `${12 * density}px Geist, sans-serif`;
    context.fillText(
      fitText(context, credit ?? 'AJ / aidenjang.com', canvas.width - 48 * density),
      24 * density,
      imageHeight + 92 * density,
    );
    const output = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (result) =>
          result ? resolve(result) : reject(new Error('Image export failed. Try again.')),
        'image/png',
      ),
    );
    return new File([output], `showroom-${car.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`, {
      type: 'image/png',
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
export function downloadPhoto(file: File) {
  const url = URL.createObjectURL(file),
    link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
}
