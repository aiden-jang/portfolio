import { photoRatio, type PhotoShape } from './state';

export async function cropStudioPhoto(
  frame: Blob,
  shape: PhotoShape,
  position: { x: number; y: number },
): Promise<Blob> {
  const source = await createImageBitmap(frame);
  try {
    const ratio = photoRatio(shape);
    const width = Math.min(source.width, source.height * ratio);
    const height = width / ratio;
    const factor = Math.min(1.6, 1440 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * factor));
    canvas.height = Math.max(1, Math.round(height * factor));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Image export is unavailable.');
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      source,
      (source.width - width) * position.x,
      (source.height - height) * position.y,
      width,
      height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Image export failed.'))),
        'image/png',
      ),
    );
  } finally {
    source.close();
  }
}
