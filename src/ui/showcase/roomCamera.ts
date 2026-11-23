import { useEffect, type RefObject } from 'react';

export function useRoomCamera(host: RefObject<HTMLDivElement>, active: boolean) {
  useEffect(() => {
    const box = host.current,
      canvas = box?.querySelector<HTMLCanvasElement>('canvas[role="img"]');
    const section = box?.closest('article');
    if (!active || !box || !canvas || !section) return;
    const sample = document.createElement('canvas');
    sample.width = 64;
    sample.height = 48;
    const g = sample.getContext('2d', { willReadFrequently: true });
    if (!g) return;
    g.imageSmoothingEnabled = false;
    let x = 0.59,
      y = 0.74;
    const position = () => {
      if (!canvas.width || !canvas.height) return;
      const zoom = 1 + 0.65 * (parseFloat(section.style.getPropertyValue('--close')) || 0);
      const scale =
        Math.max(box.clientWidth / canvas.width, box.clientHeight / canvas.height) * zoom;
      const w = canvas.width * scale,
        h = canvas.height * scale;
      box.style.setProperty('--camera-w', w + 'px');
      box.style.setProperty('--camera-h', h + 'px');
      box.style.setProperty(
        '--camera-x',
        Math.min(0, Math.max(box.clientWidth - w, box.clientWidth * 0.54 - x * w)) + 'px',
      );
      box.style.setProperty(
        '--camera-y',
        Math.min(0, Math.max(box.clientHeight - h, box.clientHeight * 0.7 - y * h)) + 'px',
      );
    };
    const frame = () => {
      if (document.hidden || section.inert || !canvas.width || !canvas.height) return;
      g.drawImage(canvas, 0, 0, 64, 48);
      const { data } = g.getImageData(0, 24, 64, 24);
      let matchingPixels = 0;
      let totalX = 0;
      let totalY = 0;
      for (let i = 0; i < data.length; i += 4) {
        const red = data[i]!;
        const green = data[i + 1]!;
        const blue = data[i + 2]!;
        if (Math.abs(red - 226) < 13 && Math.abs(green - 148) < 14 && Math.abs(blue - 77) < 16) {
          matchingPixels++;
          totalX += (i / 4) % 64;
          totalY += Math.floor(i / 256) + 24;
        }
      }
      if (matchingPixels > 4) {
        x = (totalX / matchingPixels + 0.5) / 64;
        y = (totalY / matchingPixels + 0.5) / 48;
      }
      position();
    };
    frame();
    const timer = setInterval(frame, 430);
    section.addEventListener('project-scene-progress', position);
    window.addEventListener('resize', position);
    return () => {
      clearInterval(timer);
      section.removeEventListener('project-scene-progress', position);
      window.removeEventListener('resize', position);
    };
  }, [host, active]);
}
