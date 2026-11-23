import { useEffect, type RefObject } from 'react';

export function useRoomCamera(host: RefObject<HTMLDivElement>, active: boolean, reduced: boolean) {
  useEffect(() => {
    const box = host.current;
    const canvas = box?.querySelector<HTMLCanvasElement>('canvas[role="img"]');
    const section = box?.closest('article');
    if (!active || !box || !canvas || !section) return;

    const position = () => {
      if (!canvas.width || !canvas.height) return;
      const width = box.clientWidth;
      const height = box.clientHeight;
      const close = Number(section.style.getPropertyValue('--close')) || 0;
      const zoom = !reduced && width > 700 ? 1 + 0.12 * close : 1;
      const scale = Math.max(width / canvas.width, height / canvas.height) * zoom;
      const renderedWidth = canvas.width * scale;
      const renderedHeight = canvas.height * scale;
      box.style.setProperty('--camera-w', renderedWidth + 'px');
      box.style.setProperty('--camera-h', renderedHeight + 'px');
      box.style.setProperty(
        '--camera-x',
        'clamp(calc(100% - var(--camera-w)), calc(50% - var(--camera-w) * var(--bean-focus-x, .55)), 0px)',
      );
      box.style.setProperty(
        '--camera-y',
        Math.min(0, Math.max(height - renderedHeight, height * 0.7 - renderedHeight * 0.74)) + 'px',
      );
    };

    const resize = new ResizeObserver(position);
    resize.observe(box);
    const bitmap = new MutationObserver(position);
    bitmap.observe(canvas, { attributes: true, attributeFilter: ['width', 'height'] });
    section.addEventListener('project-scene-progress', position);
    position();
    return () => {
      resize.disconnect();
      bitmap.disconnect();
      section.removeEventListener('project-scene-progress', position);
    };
  }, [host, active, reduced]);
}
