import { useEffect, useState } from 'react';

export function useActiveProject(ids: string[]): string {
  const [active, setActive] = useState('');
  const key = ids.join(',');
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      if (document.body.classList.contains('modal-open')) return;
      const section = document.getElementById('sec-work')?.getBoundingClientRect();
      const line =
        (document.querySelector('.project-toolbar')?.getBoundingClientRect().bottom ?? 0) + 48;
      if (!section || section.top > line || section.bottom < line) {
        setActive('');
        return;
      }
      let current = '';
      for (const id of key.split(',')) {
        const bounds = document.getElementById(`project-${id}`)?.getBoundingClientRect();
        if (bounds && bounds.top <= line) current = id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    const gallery = document.querySelector('.garage-project-list');
    if (gallery) observer.observe(gallery);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [key]);
  return ids.includes(active) ? active : '';
}
