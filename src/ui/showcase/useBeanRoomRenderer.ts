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
    const host = stage.closest('.duet') ?? stage;
    let openingLink = false;
    let linkFrame = 0;
    const openLinkedRoom = () => {
      if (location.hash !== '#project-mrrp') return;
      prepareRoom();
      setNear(true);
      openingLink = true;
      cancelAnimationFrame(linkFrame);
      linkFrame = requestAnimationFrame(() => {
        linkFrame = requestAnimationFrame(() => {
          openingLink = false;
        });
      });
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setNear(true);
          prepareRoom();
        } else {
          // The initial observer notification can precede the fragment scroll.
          if (openingLink) return;
          const bounds = stage.getBoundingClientRect();
          if (
            location.hash === '#project-mrrp' &&
            bounds.bottom > -160 &&
            bounds.top < innerHeight + 160
          )
            return;
          setNear(false);
          onExit();
        }
      },
      { rootMargin: '160px 0px' },
    );
    openLinkedRoom();
    addEventListener('hashchange', openLinkedRoom);
    observer.observe(host);
    const approaching = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        prepareRoom();
        approaching.disconnect();
      },
      { rootMargin: '360px 0px' },
    );
    approaching.observe(host);
    return () => {
      disposed = true;
      cancelAnimationFrame(linkFrame);
      removeEventListener('hashchange', openLinkedRoom);
      observer.disconnect();
      approaching.disconnect();
    };
  }, [onExit, room]);

  return { near, Renderer, failed };
}
