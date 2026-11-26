import { useEffect, useState, type RefObject } from 'react';

type RoomModule = typeof import('./mrrp/renderer.js');
let loading: Promise<RoomModule> | undefined;

export function useBeanRoomRenderer(room: RefObject<HTMLDivElement>, onExit: () => void) {
  const [near, setNear] = useState(false);
  const [Renderer, setRenderer] = useState<RoomModule['Cat'] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = room.current;
    if (!stage) return;
    let disposed = false;
    let requested = false;
    function prepareRoom() {
      if (requested) return;
      requested = true;
      loading ??= import('./mrrp/renderer.js');
      void loading.then(
        ({ Cat }) => {
          if (!disposed) setRenderer(() => Cat);
        },
        () => {
          if (!disposed) setFailed(true);
        },
      );
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        setNear(entry.isIntersecting);
        if (entry.isIntersecting) prepareRoom();
        else onExit();
      },
      { rootMargin: '160px 0px' },
    );
    observer.observe(stage);
    const approaching = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        prepareRoom();
        approaching.disconnect();
      },
      { rootMargin: '360px 0px' },
    );
    approaching.observe(stage.closest('.duet-stage') ?? stage);
    return () => {
      disposed = true;
      observer.disconnect();
      approaching.disconnect();
    };
  }, [onExit, room]);

  return { near, Renderer, failed };
}
